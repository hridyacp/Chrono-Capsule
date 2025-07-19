import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePolkadot } from '../context/PolkadotContext';
import { web3FromSource } from '@polkadot/extension-dapp';
import { motion } from 'framer-motion';
import { BN, BN_ZERO } from '@polkadot/util';

type FormData = {
  recipient: string;
  message: string;
  duration: number;
  value: string;
};

const CreateCapsuleForm = ({ onCapsuleCreated }: { onCapsuleCreated: () => void }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const { api, contract, selectedAccount } = usePolkadot();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmit = async (data: FormData) => {
    if (!api || !contract || !selectedAccount) return;
    setIsSubmitting(true);
    setStatus('Preparing transaction...');

    try {
      const injector = await web3FromSource(selectedAccount.meta.source);
      const valueInSmallestUnit = new BN(data.value || '0').mul(new BN(10 ** api.registry.chainDecimals[0]));

      const tx = contract.tx.createCapsule(
        { value: valueInSmallestUnit, gasLimit: -1 },
        data.recipient,
        data.message,
        data.duration
      );
      
      setStatus('Awaiting signature...');
      await tx.signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status, events }) => {
        if (status.isInBlock) {
          setStatus(`Transaction in block: ${status.asInBlock.toHex()}`);
        } else if (status.isFinalized) {
          setStatus('Capsule created successfully!');
          setIsSubmitting(false);
          reset();
          onCapsuleCreated();
          setTimeout(() => setStatus(''), 3000);
        }
      });
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setStatus(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-gray-800/80 border border-gray-700 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 transition-colors";
  const labelStyle = "block mb-1 text-sm text-gray-400";
  
  return (
    <div className="p-6 bg-black/30 backdrop-blur-sm rounded-xl shadow-lg border border-purple-500/30">
        <h2 className="text-xl font-semibold mb-4 text-purple-300">Create a New Time Capsule</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className={labelStyle}>Recipient Address</label>
                <input {...register('recipient', { required: true })} className={inputStyle} />
                {errors.recipient && <span className="text-red-400 text-xs">Recipient is required.</span>}
            </div>
            <div>
                <label className={labelStyle}>Secret Message</label>
                <textarea {...register('message', { required: true })} className={inputStyle}></textarea>
                 {errors.message && <span className="text-red-400 text-xs">A message is required.</span>}
            </div>
            <div>
                <label className={labelStyle}>Lock Duration (in Blocks, ~6s each)</label>
                <input type="number" {...register('duration', { required: true, valueAsNumber: true, min: 1 })} className={inputStyle} placeholder="e.g., 100 for ~10 minutes" />
                {errors.duration && <span className="text-red-400 text-xs">A positive duration is required.</span>}
            </div>
             <div>
                <label className={labelStyle}>Value to Lock (native tokens)</label>
                <input type="text" {...register('value', { min: 0 })} className={inputStyle} placeholder="e.g., 0.5" />
            </div>
            <motion.button 
                type="submit" 
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Sending to the Future...' : 'Lock Capsule'}
            </motion.button>
            {status && <p className="text-xs text-center mt-2 text-gray-300 transition-opacity">{status}</p>}
        </form>
    </div>
  );
};

export default CreateCapsuleForm;
