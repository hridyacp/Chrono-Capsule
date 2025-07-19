import { useState, useEffect, useCallback } from 'react';
import { usePolkadot } from '../context/PolkadotContext';

export interface Capsule {
    id: number;
    creator: string;
    recipient: string;
    message: string;
    unlock_block: number;
    value_locked: string; 
}

export const useCapsules = () => {
    const { api, contract, selectedAccount } = usePolkadot();
    const [userCapsules, setUserCapsules] = useState<Capsule[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCapsules = useCallback(async () => {
        if (!api || !contract || !selectedAccount) return;

        setIsLoading(true);
        const userAddress = selectedAccount.address;
        const fetchedCapsules: Capsule[] = [];

        try {
            const { result, output } = await contract.query.getTotalCapsules(userAddress, {});
            if (!result.isOk || !output) return;

            const totalCapsules = output.toJSON() as number;
            
            for (let i = 0; i < totalCapsules; i++) {
                const { result: capsuleResult, output: capsuleOutput } = await contract.query.getCapsule(userAddress, {}, i);

                if (capsuleResult.isOk && capsuleOutput && (capsuleOutput as any).isSome) {
                    const capsuleData = capsuleOutput.toJSON() as any; // Type assertion
                    if (capsuleData.creator === userAddress || capsuleData.recipient === userAddress) {
                        fetchedCapsules.push({
                            id: i,
                            creator: capsuleData.creator,
                            recipient: capsuleData.recipient,
                            message: new TextDecoder().decode(Uint8Array.from(capsuleData.message.slice(2).match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)))),
                            unlock_block: capsuleData.unlockBlock,
                            value_locked: capsuleData.valueLocked
                        });
                    }
                }
            }
            setUserCapsules(fetchedCapsules);
        } catch (error) {
            console.error("Failed to fetch capsules:", error);
        } finally {
            setIsLoading(false);
        }
    }, [api, contract, selectedAccount]);

    useEffect(() => {
        fetchCapsules();
    }, [fetchCapsules]);

    return { userCapsules, isLoading, refresh: fetchCapsules };
};
