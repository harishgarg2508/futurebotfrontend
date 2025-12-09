"use client"

import React, { useState, useEffect } from "react"
import { useAppStore, type ChartProfile } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  User,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Clock,
  Moon,
  Sun
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchDailyTransits, fetchNatalData, setMode, setCurrentDate, resetGochar } from "@/redux/slices/gocharSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import { NorthIndianChart } from "@/components/services/varshphal/NorthIndianChart"

export const GocharService = () => {
  const { savedProfiles } = useAppStore()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { transitData, natalData, loadingTransit, loadingNatal, error, mode, currentDate } = useSelector((state: RootState) => state.gochar)

  const [selectedProfile, setSelectedProfile] = useState<ChartProfile | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetGochar())
    }
  }, [dispatch])

  // Auto-Fetch Transits when Date changes
  useEffect(() => {
      dispatch(fetchDailyTransits(currentDate));
  }, [dispatch, currentDate]);

  // Auto-Fetch Natal Data when Profile changes
  useEffect(() => {
      if (selectedProfile) {
          dispatch(fetchNatalData({
              birthDetails: {
                  date: selectedProfile.date,
                  time: selectedProfile.time,
                  lat: selectedProfile.location.lat,
                  lon: selectedProfile.location.lon,
                  timezone: "Asia/Kolkata"
              },
              profileId: selectedProfile.id
          }));
      }
  }, [dispatch, selectedProfile]);

  const setDateShortcut = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    dispatch(setCurrentDate(date.toISOString().split('T')[0]))
  }

  // Determine Ascendant Sign ID based on Mode
  const getAscendantSignId = () => {
      if (!natalData) return 1;
      if (mode === 'moon') {
          return natalData.moon.sign_id;
      }
      return natalData.ascendant.sign_id;
  }
  
  const isLoading = loadingTransit || loadingNatal;
  const showChart = transitData && natalData;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0a0a12]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-violet-300 hover:text-violet-100 transition-all text-sm font-medium group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Go Back
            </button>
        </div>
        
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text text-transparent">
                Gochar (Planetary Transits)
              </span>
            </h1>
            <p className="text-violet-400/60 text-sm">Analyze planetary positions relative to your chart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Controls */}
            <div className="space-y-6">
                <div className="serene-glass rounded-2xl p-6 space-y-6">
                    {/* Profile Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Select Profile</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowSaved(!showSaved)}
                                className="w-full flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 hover:border-violet-500/30 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <User size={16} className="text-violet-400" />
                                    {selectedProfile ? selectedProfile.name : "Choose saved profile..."}
                                </span>
                                <ChevronDown size={16} className={`text-slate-500 transition-transform ${showSaved ? "rotate-180" : ""}`} />
                            </button>
                            
                            <AnimatePresence>
                                {showSaved && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        {savedProfiles.map(profile => (
                                            <button
                                                key={profile.id}
                                                onClick={() => {
                                                    setSelectedProfile(profile)
                                                    setShowSaved(false)
                                                }}
                                                className="w-full text-left p-3 hover:bg-violet-500/10 text-slate-300 text-sm border-b border-slate-800 last:border-0"
                                            >
                                                {profile.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Transit Date</label>
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => dispatch(setCurrentDate(e.target.value))}
                            className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 focus:border-violet-500/50 focus:outline-none transition-colors"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setDateShortcut(0)} className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">Today</button>
                            <button onClick={() => setDateShortcut(1)} className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">Tomorrow</button>
                            <button onClick={() => setDateShortcut(7)} className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">+7 Days</button>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Chart Mode</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <button
                                onClick={() => dispatch(setMode('lagna'))}
                                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                    mode === 'lagna' 
                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Lagna Gochar
                            </button>
                            <button
                                onClick={() => dispatch(setMode('moon'))}
                                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                    mode === 'moon' 
                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Chandra Gochar
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 px-1">
                            {mode === 'lagna' 
                                ? "Planetary positions relative to your Birth Ascendant." 
                                : "Planetary positions relative to your Birth Moon Sign."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Chart & Details */}
            <div className="lg:col-span-2 space-y-6">
                {showChart ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Chart */}
                        <div className="serene-glass rounded-2xl p-6 relative">
                             <div className="absolute top-4 right-4 flex flex-col items-end">
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Transit Date</span>
                                <span className="text-xl font-light text-violet-200">{transitData.meta.date}</span>
                            </div>
                            
                            <div className="mt-8">
                                <NorthIndianChart 
                                    planets={transitData.planets} 
                                    ascendantSignId={getAscendantSignId()}
                                    label={mode === 'lagna' ? "Lagna Gochar" : "Chandra Gochar"}
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="serene-glass rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800">
                                <h3 className="text-sm font-medium text-slate-200">Transit Planetary Details</h3>
                            </div>
                            <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {Object.entries(transitData.planets).map(([name, data]: [string, any]) => (
                                    <PlanetRow key={name} name={name} data={data} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[400px] serene-glass rounded-2xl">
                        {isLoading ? (
                            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles size={48} className="text-slate-700" />
                                <p>Select a profile to view Gochar</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

const PlanetRow = ({ name, data }: { name: string, data: any }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="flex flex-col transition-colors hover:bg-slate-800/30">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between p-3 w-full text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-violet-300">
                        {name.substring(0, 2)}
                    </div>
                    <div>
                        <div className="text-sm text-slate-200">{name}</div>
                        <div className="text-[10px] text-slate-500">{data.sign}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs font-mono text-emerald-300">
                            {Math.floor(data.degree)}° {Math.floor((data.degree % 1) * 60)}'
                        </div>
                        {data.is_retrograde && (
                            <div className="text-[10px] text-rose-400">Retrograde</div>
                        )}
                    </div>
                    <ChevronDown 
                        size={16} 
                        className={`text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                    />
                </div>
            </button>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-900/30"
                    >
                        <div className="p-3 pt-0 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Nakshatra</span>
                                <span className="text-slate-300 font-medium">{data.nakshatra || "-"}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Lord</span>
                                <span className="text-slate-300 font-medium">{data.nakshatra_lord || "-"}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Pada</span>
                                <span className="text-slate-300 font-medium">{data.pada || "-"}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Dignity</span>
                                <span className={`font-medium ${
                                    data.dignity === 'Exalted' ? 'text-emerald-400' : 
                                    data.dignity === 'Debilitated' ? 'text-rose-400' : 
                                    'text-slate-300'
                                }`}>{data.dignity || "Neutral"}</span>
                            </div>
                            <div className="col-span-2 p-2 rounded bg-slate-900/50 border border-slate-800/50 flex justify-between">
                                <div>
                                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Longitude</span>
                                    <span className="text-slate-300 font-mono">{data.longitude?.toFixed(4)}°</span>
                                </div>
                                {data.speed !== undefined && (
                                    <div className="text-right">
                                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Speed</span>
                                        <span className="text-slate-300 font-mono">{data.speed?.toFixed(4)}°/day</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
