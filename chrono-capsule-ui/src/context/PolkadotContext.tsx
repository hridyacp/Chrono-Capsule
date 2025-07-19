import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ContractPromise } from '@polkadot/api-contract';
import metadata from '../metadata.json'; // 

const CONTRACT_ADDRESS = "DEPLOYED_CONTRACT_ADDRESS"; 
const RPC_ENDPOINT = "wss://rpc1.paseo.popnetwork.xyz"; 

interface PolkadotContextState {
  api: ApiPromise | null;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  contract: ContractPromise | null;
  currentBlock: number;
  connect: () => void;
  setSelectedAccount: (account: InjectedAccountWithMeta) => void;
}

const PolkadotContext = createContext<PolkadotContextState>({} as PolkadotContextState);

export const PolkadotProvider = ({ children }: { children: ReactNode }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [contract, setContract] = useState<ContractPromise | null>(null);
  const [currentBlock, setCurrentBlock] = useState(0);

  const setup = async () => {
    const wsProvider = new WsProvider(RPC_ENDPOINT);
    const api = await ApiPromise.create({ provider: wsProvider });
    setApi(api);

    api.rpc.chain.subscribeNewHeads((header) => {
        setCurrentBlock(header.number.toNumber());
    });
  };

  const connectWallet = async () => {
    try {
      await web3Enable('Chrono-Capsule DApp');
      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
      }
    } catch (error) {
      console.error("Error connecting to wallet: ", error);
    }
  };
  
  useEffect(() => {
    setup();
  }, []);

  useEffect(() => {
    if (api) {
        setContract(new ContractPromise(api, metadata, CONTRACT_ADDRESS));
    }
  }, [api]);


  return (
    <PolkadotContext.Provider value={{ api, accounts, selectedAccount, contract, currentBlock, setSelectedAccount, connect: connectWallet }}>
      {children}
    </PolkadotContext.Provider>
  );
};

export const usePolkadot = () => useContext(PolkadotContext);
