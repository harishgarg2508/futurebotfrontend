import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface VargaSelectionProps {
  selectedVargas: number[];
  onToggleVarga: (varga: number) => void;
  onSelectGroup: (vargas: number[]) => void;
  onGetCharts: () => void;
  loading: boolean;
  disabled: boolean;
}

const VARGA_GROUPS = [
  { name: 'Shadvarga', vargas: [1, 2, 3, 9, 12, 30] },
  { name: 'Saptavarga', vargas: [1, 2, 3, 7, 9, 12, 30] },
  { name: 'Dashavarga', vargas: [1, 2, 3, 7, 9, 10, 12, 16, 30, 60] },
  { name: 'Shodashavarga', vargas: [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60] },
];

const ALL_VARGAS = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
  { id: 11 },
  { id: 12 },
  { id: 16 },
  { id: 20 },
  { id: 24 },
  { id: 27 },
  { id: 30 },
  { id: 40 },
  { id: 45 },
  { id: 60 },
];

export const VargaSelection: React.FC<VargaSelectionProps> = ({
  selectedVargas,
  onToggleVarga,
  onSelectGroup,
  onGetCharts,
  loading,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-4 bg-white/5 rounded-xl border border-white/10">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">{t('varga.groups')}</h3>
        <div className="flex flex-wrap gap-3">
          {VARGA_GROUPS.map((group) => (
            <button
              key={group.name}
              onClick={() => onSelectGroup(group.vargas)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                JSON.stringify(selectedVargas.slice().sort()) === JSON.stringify(group.vargas.slice().sort())
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {t(`varga.group_names.${group.name}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">{t('varga.individual')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {ALL_VARGAS.map((varga) => (
            <button
              key={varga.id}
              onClick={() => onToggleVarga(varga.id)}
              className={`p-2 rounded-lg text-xs font-medium transition-all border ${
                selectedVargas.includes(varga.id)
                  ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                  : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
              }`}
            >
              {t(`varga.charts.${varga.id}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onGetCharts}
          disabled={disabled || loading || selectedVargas.length === 0}
          className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
            disabled || loading || selectedVargas.length === 0
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/30'
          }`}
        >
          {loading ? t('varga.calculating') : t('varga.get_charts')}
        </button>
      </div>
    </div>
  );
};
