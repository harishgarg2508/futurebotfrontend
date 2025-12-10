import React from 'react';
import { motion } from 'framer-motion';

interface ArchetypeCardProps {
  archetype: string;
  description?: string;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ archetype, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-900 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] text-center relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-amber-500 blur-xl opacity-50"></div>

      <div className="relative z-10">
        <span className="text-amber-500/80 text-sm font-serif tracking-[0.2em] uppercase mb-4 block">
          Your Neural Archetype
        </span>
        
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif drop-shadow-lg mb-4">
          {archetype}
        </h2>
        
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-6 opacity-60"></div>
        
        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto font-light">
          {description || "A unique synthesis of planetary energies creating a distinct path to success and fulfillment."}
        </p>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 text-amber-500 font-serif select-none pointer-events-none">
          ✦
        </div>
      </div>
    </motion.div>
  );
};

export default ArchetypeCard;
