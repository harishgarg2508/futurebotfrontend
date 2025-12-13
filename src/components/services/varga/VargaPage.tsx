'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchVargaCharts, setSelectedVargas, resetSelection, resetLoadingState, generateCacheKey } from '@/redux/slices/vargaSlice';
import { VargaSelection } from './VargaSelection';
import { VargaChartDisplay } from './VargaChartDisplay';
import { useAppStore, type ChartProfile } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function VargaPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cache, loading, selectedVargas } = useSelector((state: RootState) => state.varga);
  const { savedProfiles } = useAppStore();
  const { t } = useTranslation();
  
  const [selectedProfile, setSelectedProfile] = useState<ChartProfile | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Reset loading state on mount (in case of persisted stale state)
  useEffect(() => {
    dispatch(resetLoadingState());
  }, [dispatch]);

  // Reset selection when profile changes
  useEffect(() => {
    if (selectedProfile) {
        dispatch(resetSelection());
    }
  }, [selectedProfile, dispatch]);

  const handleToggleVarga = (vargaId: number) => {
    const newSelection = selectedVargas.includes(vargaId)
      ? selectedVargas.filter(id => id !== vargaId)
      : [...selectedVargas, vargaId];
    dispatch(setSelectedVargas(newSelection));
  };

  const handleSelectGroup = (groupVargas: number[]) => {
    dispatch(setSelectedVargas(groupVargas));
  };
  
  const handleClearSelection = () => {
    dispatch(resetSelection());
  };

  const handleGetCharts = () => {
    if (selectedVargas.length === 0) return;
    
    if (!selectedProfile) {
      alert("Please select a user profile first.");
      return;
    }

    dispatch(fetchVargaCharts({
      date: selectedProfile.date,
      time: selectedProfile.time,
      lat: selectedProfile.location.lat,
      lon: selectedProfile.location.lon,
      timezone: 'Asia/Kolkata', // Assuming default or add to profile
      vargaNums: selectedVargas
    }));
  };

  // Determine current charts based on selected profile
  const currentCacheKey = selectedProfile 
    ? generateCacheKey(selectedProfile.date, selectedProfile.time, selectedProfile.location.lat, selectedProfile.location.lon)
    : null;
    
  const currentCharts = currentCacheKey ? (cache[currentCacheKey] || {}) : {};

  // Check which charts are available to display
  const availableCharts = selectedVargas
    .filter(vId => currentCharts[vId])
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex justify-between items-center">
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm font-medium group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {t('go_back')}
            </button>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {t('services.varga.title')}
            </h1>
            <p className="text-gray-400">{t('services.varga.desc')}</p>
          </div>
        </header>

        {/* Profile Selection */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-gray-200 hover:border-purple-500/30 transition-colors"
            >
              <span className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <User size={20} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-400">{t('dasha.choose_profile')}</div>
                  <div className="font-medium">{selectedProfile ? selectedProfile.name : t('dasha.choose_profile')}</div>
                </div>
              </span>
              <ChevronDown size={20} className={`text-gray-500 transition-transform ${showSaved ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar"
                >
                  {savedProfiles.length > 0 ? (
                    savedProfiles.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfile(profile);
                          setShowSaved(false);
                        }}
                        className="w-full text-left p-4 hover:bg-white/5 text-gray-300 border-b border-gray-800 last:border-0 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400">
                          {profile.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-xs text-gray-500">{profile.date} • {profile.time}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No profiles found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <VargaSelection
          selectedVargas={selectedVargas}
          onToggleVarga={handleToggleVarga}
          onSelectGroup={handleSelectGroup}
          onGetCharts={handleGetCharts}
          onClearSelection={handleClearSelection}
          loading={loading}
          disabled={!selectedProfile}
        />

        {availableCharts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availableCharts.map(vId => {
              const desc = t(`varga.descriptions.${vId}`);
              const shortDesc = desc.split(',')[0];
              return (
                <VargaChartDisplay
                  key={vId}
                  chartData={currentCharts[vId]}
                  title={`D${vId} - ${shortDesc}`}
                  description={desc}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
