import React from 'react';
import { usePolkadot } from '../context/PolkadotContext';
import { useCapsules } from '../hooks/useCapsules';
import { motion, AnimatePresence } from 'framer-motion';
import CreateCapsuleForm from './CreateCapsuleForm';
import CapsuleCard from './CapsuleCard';

const CapsuleDashboard = () => {
  const { selectedAccount } = usePolkadot();
  const { userCapsules, isLoading, refresh } = useCapsules();

  if (!selectedAccount) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-20 p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/30"
      >
        <h2 className="text-2xl mb-4">Please connect your wallet to begin.</h2>
        <p className="text-gray-400">Your journey through time awaits!</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <CreateCapsuleForm onCapsuleCreated={refresh} />
      </div>
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-semibold mb-4 text-purple-300 border-b border-purple-500/20 pb-2">Your Time Capsules</h2>
        {isLoading && <p>Loading capsules...</p>}
        {!isLoading && userCapsules.length === 0 && (
            <p className="text-gray-400 mt-4">No capsules found for your account. Create one to get started!</p>
        )}
        <AnimatePresence>
          <div className="space-y-4">
            {userCapsules.map(capsule => (
                <CapsuleCard key={capsule.id} capsule={capsule} onCapsuleOpened={refresh} />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CapsuleDashboard;
