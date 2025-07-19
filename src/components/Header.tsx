import React from 'react';
import ConnectWallet from './ConnectWallet';
import { motion } from 'framer-motion';

const Header = () => (
  <motion.header 
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    className="flex justify-between items-center py-4 border-b border-purple-500/30"
  >
    <div className="flex items-center space-x-3">
        <svg width="32" height="32" viewBox="0 0 24 24" className="text-purple-400">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12H18A6,6 0 0,0 12,6V4M4,12A8,8 0 0,1 12,4V6A6,6 0 0,0 6,12H4M12,18A6,6 0 0,0 18,12H20A8,8 0 0,1 12,20V18M11,7V12.5L15.25,15.3L16,14.1L12.5,11.8V7H11Z" />
        </svg>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
        Chrono-Capsule
        </h1>
    </div>

    <ConnectWallet />
  </motion.header>
);

export default Header;
