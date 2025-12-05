import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Star, Activity } from 'lucide-react';

interface PlanetarySidebarProps {
  chartData: any;
}

const PlanetarySidebar: React.FC<PlanetarySidebarProps> = ({ chartData }) => {
  if (!chartData) return null;

  // Helper to find planet in chart data
  // Assuming chartData structure based on typical Vedic API responses
  // We might need to adjust this based on actual API response
  const getPlanetSign = (planetName: string) => {
    // Placeholder logic - replace with actual data parsing
    // If chartData is raw JSON, we need to know the structure.
    // For now, I'll assume a simple structure or just show placeholders if data is complex
    return chartData.planets?.[planetName]?.sign || 'Unknown';
  };
  
  const ascendant = chartData.ascendant?.sign || 'Cancer'; // Fallback for demo
  const sunSign = getPlanetSign('Sun') || 'Scorpio';
  const moonSign = getPlanetSign('Moon') || 'Pisces';

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-80 h-full glass-panel border-r border-white/10 p-6 space-y-8"
    >
      <div className="space-y-2">
        <h3 className="text-vedic-gold text-sm uppercase tracking-widest font-semibold">Cosmic Identity</h3>
        <h1 className="text-3xl text-white font-serif">Natal Chart</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="p-3 bg-vedic-gold/10 rounded-full text-vedic-gold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Ascendant (Lagna)</p>
            <p className="text-lg text-white font-serif">{ascendant}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="p-3 bg-vedic-gold/10 rounded-full text-vedic-gold">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Sun Sign (Surya)</p>
            <p className="text-lg text-white font-serif">{sunSign}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="p-3 bg-vedic-gold/10 rounded-full text-vedic-gold">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Moon Sign (Chandra)</p>
            <p className="text-lg text-white font-serif">{moonSign}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <p className="text-xs text-center text-gray-500">
          VedicAI System v1.0
          <br />
          Aligning with the Cosmos
        </p>
      </div>
    </motion.div>
  );
};

export default PlanetarySidebar;
