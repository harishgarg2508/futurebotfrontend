"use client"

import React, { useState, useEffect } from "react"
import { useAppStore, type ChartProfile } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  User,
  ChevronDown,
  ArrowLeft,
  Sun,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchVarshphal, clearVarshphalResult } from "@/redux/slices/varshphalSlice"
import type { RootState, AppDispatch } from "@/redux/store"
import axios from "axios"
import { NorthIndianChart } from "./NorthIndianChart"

export const VarshphalPage = () => {
  const { savedProfiles } = useAppStore()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { result, loading, error } = useSelector((state: RootState) => state.varshphal)

  // Form State
  const [selectedProfile, setSelectedProfile] = useState<ChartProfile | null>(null)
  const [age, setAge] = useState<number | "">("")
  const [yearRange, setYearRange] = useState<string>("")
  
  // Search State
  const [showSaved, setShowSaved] = useState(false)
  const [locQuery, setLocQuery] = useState("")
  const [locResults, setLocResults] = useState<any[]>([])
  const [loadingLoc, setLoadingLoc] = useState(false)
  
  // Manual Input State (if not using saved profile)
  const [manualData, setManualData] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
    time: "",
    location: null as { lat: number; lon: number; city: string } | null
  })

  // Update Year Range when Age changes
  useEffect(() => {
    if (age !== "" && (selectedProfile || manualData.year)) {
      const birthYear = selectedProfile 
        ? parseInt(selectedProfile.date.split("-")[0]) 
        : parseInt(manualData.year)
      
      if (!isNaN(birthYear)) {
        const startYear = birthYear + Number(age)
        setYearRange(`${startYear} - ${startYear + 1}`)
      }
    } else {
      setYearRange("")
    }
  }, [age, selectedProfile, manualData.year])

  // Debounce Location Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locQuery.length >= 3) {
        searchLocation(locQuery)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [locQuery])

  const searchLocation = async (q: string) => {
    if (q.length < 3) return
    setLoadingLoc(true)
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
      setLocResults(res.data.slice(0, 5))
    } catch {
    } finally {
      setLoadingLoc(false)
    }
  }

  const handleCalculate = () => {
    if (age === "") {
        alert("Please enter age")
        return
    }

    let payload;
    if (selectedProfile) {
        const [year, month, day] = selectedProfile.date.split("-")
        payload = {
            date: selectedProfile.date,
            time: selectedProfile.time,
            lat: selectedProfile.location.lat,
            lon: selectedProfile.location.lon,
            age: Number(age)
        }
    } else if (manualData.location && manualData.year && manualData.month && manualData.day && manualData.time) {
        payload = {
            date: `${manualData.year}-${manualData.month}-${manualData.day.padStart(2, '0')}`,
            time: manualData.time,
            lat: manualData.location.lat,
            lon: manualData.location.lon,
            age: Number(age)
        }
    } else {
        alert("Please provide birth details")
        return
    }

    dispatch(fetchVarshphal(payload))
  }

  const handleReset = () => {
    dispatch(clearVarshphalResult())
    setSelectedProfile(null)
    setManualData({ name: "", day: "", month: "", year: "", time: "", location: null })
    setAge("")
    setYearRange("")
  }

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
                onClick={() => {
                    if (result) {
                        handleReset()
                    } else {
                        router.push("/")
                    }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-violet-300 hover:text-violet-100 transition-all text-sm font-medium group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Go Back
            </button>
        </div>
        
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text text-transparent">
                Varshphal (Annual Horoscope)
              </span>
            </h1>
            <p className="text-violet-400/60 text-sm">Discover your annual solar return chart and Muntha</p>
        </div>

        <AnimatePresence mode="wait">
            {!result ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-xl mx-auto serene-glass rounded-2xl p-6 space-y-6"
                >
                    {/* Profile Selection */}
                    <div className="space-y-4">
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

                    {/* Or Manual Input (Simplified for brevity, can expand if needed) */}
                    {!selectedProfile && (
                        <div className="text-center text-xs text-slate-500">- OR Enter Details -</div>
                    )}

                    {/* Age Input */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">Age for Annual Chart</label>
                            {yearRange && (
                                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                    {yearRange}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Enter Age (e.g. 24)"
                                value={age}
                                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 focus:border-violet-500/50 focus:outline-none transition-colors"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                Years
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Varshphal
                            </>
                        )}
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Left: Chart */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="serene-glass rounded-2xl p-6 relative">
                            <div className="absolute top-4 right-4 flex flex-col items-end">
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Varshphal Year</span>
                                <span className="text-xl font-light text-violet-200">{result.meta.year} ({yearRange})</span>
                            </div>
                            
                            <div className="mt-8">
                                <NorthIndianChart 
                                    planets={result.planets} 
                                    ascendantSignId={result.ascendant.sign_id}
                                    munthaSignId={result.muntha.sign_id}
                                    label="Annual Chart (D1)"
                                />
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                                    <span>Muntha</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    <span>Planets</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-6">
                        {/* Muntha Card */}
                        <div className="serene-glass rounded-2xl p-5 border-l-2 border-rose-400">
                            <h3 className="text-sm font-medium text-rose-300 mb-1 flex items-center gap-2">
                                <Sun size={14} />
                                Muntha Position
                            </h3>
                            <div className="text-2xl font-light text-white mb-1">
                                {result.muntha.sign}
                            </div>
                            <p className="text-xs text-slate-400">
                                Located in the {((result.muntha.sign_id - result.ascendant.sign_id + 12) % 12) + 1}th House of the annual chart.
                            </p>
                        </div>

                        {/* Planetary Details */}
                        <div className="serene-glass rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800">
                                <h3 className="text-sm font-medium text-slate-200">Planetary Degrees</h3>
                            </div>
                            <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {Object.entries(result.planets).map(([name, data]: [string, any]) => (
                                    <PlanetRow key={name} name={name} data={data} />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
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
