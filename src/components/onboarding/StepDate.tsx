import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';

interface StepDateProps {
  name: string;
  onNext: (date: string) => void;
  onBack: () => void;
}

const StepDate: React.FC<StepDateProps> = ({ name, onNext, onBack }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (day && month && year) {
      // Pad single digits
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      const dateString = `${year}-${paddedMonth}-${paddedDay}`;
      onNext(dateString);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-8"
    >
      <h2 className="text-3xl font-light text-center text-white font-serif">
        Welcome, <span className="text-vedic-gold">{name}</span>.
        <br />
        <span className="text-xl mt-4 block text-gray-300">On what date did your soul enter this world?</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="flex space-x-2">
          {/* Day Input */}
          <div className="w-1/4 relative">
             <input
              type="number"
              placeholder="DD"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value.slice(0, 2))}
              className="w-full p-4 text-xl text-center glass-input rounded-xl appearance-none"
              required
            />
            <span className="text-xs text-gray-500 absolute -bottom-5 left-1/2 -translate-x-1/2">Day</span>
          </div>

          {/* Month Input */}
          <div className="flex-1 relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-4 text-xl text-center glass-input rounded-xl appearance-none bg-transparent"
              required
              style={{ colorScheme: 'dark' }} // Attempt to style native dropdown dark
            >
              <option value="" disabled className="text-black bg-gray-200">Month</option> {/* Fallback styling */}
              {months.map((m, idx) => (
                <option key={m} value={idx + 1} className="text-black">
                  {m}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500 absolute -bottom-5 left-1/2 -translate-x-1/2">Month</span>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className="w-4 h-4 text-vedic-gold opacity-50" />
            </div>
          </div>

          {/* Year Input */}
          <div className="w-1/3 relative">
            <input
              type="number"
              placeholder="YYYY"
              min="1900"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value.slice(0, 4))}
              className="w-full p-4 text-xl text-center glass-input rounded-xl appearance-none"
              required
            />
            <span className="text-xs text-gray-500 absolute -bottom-5 left-1/2 -translate-x-1/2">Year</span>
          </div>
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
            disabled={!day || !month || !year}
            className="flex-1 p-4 flex items-center justify-center space-x-2 glass-button rounded-xl disabled:opacity-50"
          >
            <span>Confirm Date</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StepDate;
