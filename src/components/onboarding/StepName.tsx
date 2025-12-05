import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface StepNameProps {
  onNext: (name: string) => void;
}

const StepName: React.FC<StepNameProps> = ({ onNext }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext(name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-8"
    >
      <h2 className="text-3xl font-light text-center text-white font-serif">
        Greetings. To align with the stars, I must know you.
        <br />
        <span className="text-vedic-gold mt-2 block text-2xl">What is your name?</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full p-4 text-xl text-center glass-input rounded-xl"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full p-4 flex items-center justify-center space-x-2 glass-button rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Begin Journey</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
};

export default StepName;
