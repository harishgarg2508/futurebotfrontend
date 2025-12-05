import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';

interface StepTimeProps {
  onNext: (time: string) => void;
  onBack: () => void;
}

const StepTime: React.FC<StepTimeProps> = ({ onNext, onBack }) => {
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (time) {
      onNext(time);
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
        At what precise moment?
        <br />
        <span className="text-sm text-gray-400 mt-2 block">(Exact time is crucial for Ascendant calculation)</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-vedic-gold w-6 h-6" />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-4 pl-14 text-xl text-center glass-input rounded-xl appearance-none"
            required
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 p-4 glass-button rounded-xl text-gray-400 hover:text-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!time}
            className="flex-1 p-4 flex items-center justify-center space-x-2 glass-button rounded-xl disabled:opacity-50"
          >
            <span>Confirm Time</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StepTime;
