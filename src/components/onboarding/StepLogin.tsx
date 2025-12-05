import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import LoginButton from '@/components/auth/LoginButton';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface StepLoginProps {
  onNext: () => void;
  onBack: () => void;
}

const StepLogin: React.FC<StepLoginProps> = ({ onNext, onBack }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      onNext();
    }
  }, [user, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center space-y-8 z-10 max-w-md w-full px-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif text-vedic-gold">Identify Yourself</h2>
        <p className="text-gray-400 font-light">
          Connect your soul to the digital ether to save your cosmic blueprint.
        </p>
      </div>

      <div className="w-full flex justify-center py-8">
        <LoginButton />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="p-4 rounded-full glass-panel hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </button>
        <button
          onClick={onNext}
          className="px-8 py-4 glass-button rounded-full text-sm tracking-widest uppercase hover:bg-vedic-gold hover:text-vedic-blue transition-all duration-500"
        >
          Skip for Now
        </button>
      </div>
    </motion.div>
  );
};

export default StepLogin;
