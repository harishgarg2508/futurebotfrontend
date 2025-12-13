import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface VargaSelectionProps {
  selectedVargas: number[];
  onToggleVarga: (varga: number) => void;
  onSelectGroup: (vargas: number[]) => void;
  onGetCharts: () => void;
  onClearSelection: () => void;
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
  onClearSelection,
  loading,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-4 bg-white/5 rounded-xl border border-white/10">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">{t('varga.groups')}</h3>
          {selectedVargas.length > 0 && (
            <button
              onClick={onClearSelection}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-300 hover:text-red-100 transition-all text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              {t('clear_selection', { defaultValue: 'Clear Selection' })}
            </button>
          )}
        </div>
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
