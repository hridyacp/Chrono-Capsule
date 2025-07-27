import React from 'react';
import { usePolkadot } from '../context/PolkadotContext';
import { motion } from 'framer-motion';

const ConnectWallet = () => {
  const { connect, accounts, selectedAccount, setSelectedAccount, balance } = usePolkadot();
  if (!selectedAccount) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={connect}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/40 transition-shadow"
      >
        Connect Wallet
      </motion.button>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm border border-gray-700 p-2 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      <select
        value={selectedAccount.address}
        onChange={(e) => {
          const account = accounts.find(a => a.address === e.target.value);
          if (account) {
            setSelectedAccount(account);
          }
        }}
        className="bg-transparent border-none focus:ring-0 text-sm appearance-none cursor-pointer"
      >
        {accounts.map(account => (
          <option key={account.address} value={account.address} className="bg-gray-800 text-white">
            {account.meta.name} ({account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)})
          </option>
        ))}
      </select>
      <div className="text-sm text-pink-400 font-semibold pr-2">
        {balance}
      </div>
    </div>
  );
};

export default ConnectWallet;
