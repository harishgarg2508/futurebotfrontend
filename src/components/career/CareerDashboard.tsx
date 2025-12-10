"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCareerPrediction, clearCareerData } from '@/redux/slices/careerSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Briefcase, ChevronDown, RefreshCw } from 'lucide-react';
import ArchetypeCard from './ArchetypeCard';
import CareerScorecard from './CareerScorecard';

const CareerDashboard = () => {
    const { user } = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    const { currentPrediction, loading, error } = useSelector((state: RootState) => state.career);
    
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [fetchingProfiles, setFetchingProfiles] = useState(true);

    // 1. Fetch Profiles
    useEffect(() => {
        const fetchProfiles = async () => {
            if (!user) return;
            try {
                const querySnapshot = await getDocs(collection(db, "users", user.uid, "profiles"));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProfiles(data);
                if (data.length > 0) {
                     // Automatically select first profile if none selected? 
                     // Or let user choose. Let's let user choose but maybe default to first if easy.
                }
            } catch (e) {
                console.error("Error fetching profiles", e);
            } finally {
                setFetchingProfiles(false);
            }
        };
        fetchProfiles();
    }, [user]);

    // 2. Handle Profile Selection & Prediction
    const handleGenerate = () => {
        if (!selectedProfileId) return;
        const profile = profiles.find(p => p.id === selectedProfileId);
        if (!profile) return;

        dispatch(fetchCareerPrediction({
            date: profile.date,
            time: profile.time,
            lat: profile.location.lat,
            lon: profile.location.lon,
            timezone: profile.location.timezone
        }));
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-amber-50 p-6 md:p-12 font-sans selection:bg-amber-500/30">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-widest uppercase mb-6"
                >
                    <Sparkles size={12} />
                    <span>Titan Career Engine V1</span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 mb-6"
                >
                    Unlock Your Professional Destiny
                </motion.h1>
                
                <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light">
                    Harness the power of 1,000+ ancient yogas and AI analysis to discover your true career archetype and wealth potential.
                </p>
            </header>

            {/* Controls */}
            <div className="max-w-xl mx-auto mb-20 relative z-20">
                <div className="p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2 shadow-2xl">
                    <div className="relative flex-1">
                        <select 
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="w-full bg-transparent text-white px-4 py-3 appearance-none outline-none cursor-pointer font-medium"
                            disabled={fetchingProfiles}
                        >
                            <option value="" disabled>Select a Profile...</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id} className="bg-zinc-900">
                                    {p.name} ({p.date})
                                </option>
                            ))}
                            {profiles.length === 0 && !fetchingProfiles && (
                                <option disabled>No profiles found</option>
                            )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedProfileId || loading}
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <Briefcase size={18} />}
                        <span>Analyze</span>
                    </button>
                </div>
            </div>

            {/* Results Area */}
            <div className="max-w-7xl mx-auto relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                            <p className="text-amber-200/60 font-serif text-xl animate-pulse">Consulting the Stars...</p>
                            <p className="text-zinc-500 text-sm mt-2">Scanning 1,000+ Yogas</p>
                        </motion.div>
                    )}

                    {!loading && currentPrediction && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-16"
                        >
                            {/* Archetype Hero */}
                            <section className="max-w-3xl mx-auto">
                                <ArchetypeCard 
                                    archetype={currentPrediction.archetype} 
                                />
                            </section>

                            {/* Scorecard */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                                    <h3 className="text-amber-500 font-serif text-xl tracking-widest uppercase">Career Matrix</h3>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/50"></div>
                                </div>
                                <CareerScorecard data={currentPrediction} />
                            </section>
                            
                            {/* Detailed Yogas (Sherlock Style) */}
                            {currentPrediction.unlocked_yogas && currentPrediction.unlocked_yogas.length > 0 && (
                                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="col-span-full mb-4">
                                         <h3 className="text-zinc-400 font-serif text-lg">Active Cosmic Influences</h3>
                                    </div>
                                    {currentPrediction.unlocked_yogas.slice(0, 6).map((yoga, i) => (
                                        <div key={i} className="p-6 rounded-xl bg-zinc-900 border border-white/5 hover:border-amber-500/20 transition-colors">
                                            <div className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">{yoga.name}</div>
                                            <div className="text-zinc-300 text-sm leading-relaxed mb-4">"{yoga.result}"</div>
                                            <div className="flex flex-wrap gap-2">
                                                {yoga.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-zinc-500">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}
                        </motion.div>
                    )}
                    
                    {!loading && !currentPrediction && !error && (
                        <div className="text-center text-zinc-600 mt-20">
                             Select a profile above to begin the analysis.
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CareerDashboard;
