import React from 'react';
import { motion } from 'framer-motion';
import { CareerPredictionResult } from '@/redux/slices/careerSlice';

interface CareerScorecardProps {
  data: CareerPredictionResult;
}

const CareerScorecard: React.FC<CareerScorecardProps> = ({ data }) => {
  const topCareers = data.scores.CAREER.slice(0, 3);
  const attributes = data.scores.ATTRIBUTES;

  return (
    <div className="space-y-8">
      {/* Top 3 Careers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topCareers.map((career, index) => (
          <motion.div
            key={career.career}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm
              hover:border-amber-500/30 transition-all duration-300 group relative
              ${index === 0 ? 'bg-gradient-to-b from-amber-900/10 to-transparent border-amber-500/20' : ''}
            `}
          >
             {index === 0 && (
                <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-bl-lg">
                  TOP MATCH
                </div>
             )}
             
            <h3 className="text-xl font-medium text-amber-100 mb-2">
              {career.career.replace(/_/g, ' ')}
            </h3>
            
            <div className="flex items-end gap-2">
               <span className="text-4xl font-bold text-amber-500">{career.match_pct}%</span>
               <span className="text-sm text-zinc-500 mb-1">Match</span>
            </div>
            
            <div className="mt-4 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${career.match_pct}%` }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(attributes).map(([key, score], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + (i * 0.05) }}
              className="p-4 rounded-lg bg-zinc-900/50 border border-white/5 text-center"
            >
              <div className="text-zinc-400 text-xs tracking-wider uppercase mb-2">{key.replace(/_/g, ' ')}</div>
              <div className="text-2xl font-semibold text-amber-200">{score}</div>
              <div className="text-[10px] text-zinc-600">Points</div>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CareerScorecard;
