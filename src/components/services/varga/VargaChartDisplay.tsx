import React, { useState } from 'react';
import { NorthIndianChart } from '../varshphal/NorthIndianChart';
import { VargaChartData } from '@/redux/slices/vargaSlice';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface VargaChartDisplayProps {
  chartData: VargaChartData;
  title: string;
  description?: string;
}

export const VargaChartDisplay: React.FC<VargaChartDisplayProps> = ({ chartData, title, description }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Convert VargaChartData to format expected by NorthIndianChart
  // NorthIndianChart expects { [key: number]: string[] } where key is house number (1-12)
  // and value is array of planet names.
  
  const getChartPoints = () => {
    const points: Record<number, string[]> = {};
    
    // Initialize houses
    for (let i = 1; i <= 12; i++) points[i] = [];
    
    return points;
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      </div>

      <div className="p-4 flex justify-center bg-white/5">
        <NorthIndianChart 
          ascendantSignId={chartData.ascendant.sign_id}
          planets={chartData.planets}
        />
      </div>

      <div className="border-t border-white/10">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 flex items-center justify-between text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
        >
          <span>{t('varga.planetary_details')}</span>
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 grid gap-2 bg-black/20">
                {Object.entries(chartData.planets).map(([planet, data]) => (
                  <div key={planet} className="bg-white/5 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedPlanet(expandedPlanet === planet ? null : planet)}
                      className="w-full p-2 flex items-center justify-between text-xs text-gray-200 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-16 text-left">{t(`planets.${planet}`, { defaultValue: planet })}</span>
                        <span className="text-purple-300">{t(`signs.${data.sign}`, { defaultValue: data.sign })}</span>
                        <span className="text-gray-400">{data.longitude.toFixed(2)}°</span>
                      </div>
                      {expandedPlanet === planet ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    
                    {expandedPlanet === planet && (
                      <div className="p-2 bg-black/40 text-xs text-gray-400 grid grid-cols-2 gap-2">
                        <div>{t('varga.sign_id')}: {data.sign_id}</div>
                        <div>{t('varga.full_deg')}: {data.full_degree.toFixed(2)}°</div>
                        <div>{t('varga.speed')}: {data.speed.toFixed(4)}</div>
                        {data.nakshatra && <div>{t('varga.nakshatra')}: {data.nakshatra}</div>}
                        {data.nakshatra_lord && <div>{t('varga.lord')}: {t(`planets.${data.nakshatra_lord}`, { defaultValue: data.nakshatra_lord })}</div>}
                        {data.pada && <div>{t('varga.pada')}: {data.pada}</div>}
                        {data.dignity && <div>{t('varga.dignity')}: {data.dignity}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
