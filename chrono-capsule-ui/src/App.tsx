import React from 'react';
import { PolkadotProvider } from './context/PolkadotContext';
import Header from './components/Header';
import CapsuleDashboard from './/components/CapsuleDashboard';

function App() {
  return (
    <PolkadotProvider>
      <div className="min-h-screen bg-gray-900 text-white font-mono overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900 opacity-80"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto p-4 md:p-8">
          <Header />
          <main className="mt-8">
            <CapsuleDashboard />
          </main>
        </div>
      </div>
    </PolkadotProvider>
  );
}

export default App;
