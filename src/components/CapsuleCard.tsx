import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePolkadot } from '../context/PolkadotContext';
import { Capsule } from '../hooks/useCapsules';
import { web3FromSource } from '@polkadot/extension-dapp';
import { formatBalance } from '@polkadot/util';

interface CapsuleCardProps {
    capsule: Capsule;
    onCapsuleOpened: () => void;
}

const CapsuleCard = ({ capsule, onCapsuleOpened }: CapsuleCardProps) => {
    const { api, contract, selectedAccount, currentBlock } = usePolkadot();
    const [isOpening, setIsOpening] = useState(false);
    const [status, setStatus] = useState('');
    const [revealedMessage, setRevealedMessage] = useState<string | null>(null);

    const isRecipient = selectedAccount?.address === capsule.recipient;
    const isUnlockable = currentBlock >= capsule.unlock_block;
    const blocksRemaining = Math.max(0, capsule.unlock_block - currentBlock);

    const handleOpen = async () => {
        if (!api || !contract || !selectedAccount || !isRecipient || !isUnlockable) return;

        setIsOpening(true);
        setStatus('Preparing to open...');
        
        try {
            const injector = await web3FromSource(selectedAccount.meta.source);
            await contract.tx
                .openCapsule({ gasLimit: -1 }, capsule.id)
                .signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status }) => {
                    if (status.isFinalized) {
                        setStatus('Capsule opened!');
                        setRevealedMessage(capsule.message);
                        setTimeout(() => onCapsuleOpened(), 3000);
                    }
                });
        } catch(error: any) {
            console.error("Failed to open capsule:", error);
            setStatus(`Error: ${error.message}`);
            setIsOpening(false);
        }
    };
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring' }}
            className="p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-gray-700 space-y-2"
        >
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-pink-400">Capsule #{capsule.id}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${isUnlockable ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {isUnlockable ? 'Ready to Open' : 'Locked'}
                </span>
            </div>
            
            {revealedMessage ? (
                <div className="p-4 bg-purple-500/10 rounded-md border border-purple-400">
                    <p className="font-bold text-purple-300">Message Revealed:</p>
                    <p className="text-white italic">"{revealedMessage}"</p>
                </div>
            ) : (
                <div className="text-sm text-gray-300">
                    <p><strong>Recipient:</strong> {capsule.recipient.substring(0,8)}...</p>
                    <p><strong>Value Locked:</strong> {formatBalance(capsule.value_locked, { withSi: false, forceUnit: '-' })}</p>
                    <p><strong>Unlocks in:</strong> ~{blocksRemaining * 6} seconds ({blocksRemaining} blocks)</p>
                </div>
            )}

            {isRecipient && !revealedMessage && (
                <motion.button
                    onClick={handleOpen}
                    disabled={!isUnlockable || isOpening}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-2 py-2 text-sm bg-pink-600 rounded-lg font-bold disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isOpening ? status : 'Open Capsule'}
                </motion.button>
            )}
        </motion.div>
    );
};

export default CapsuleCard;
