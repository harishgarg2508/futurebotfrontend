"use client"

import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAppStore, type ChartProfile } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  User,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchDashaPeriods, togglePath, resetDasha } from "@/redux/slices/dashaSlice"
import type { RootState, AppDispatch } from "@/redux/store"

export const DashaService = () => {
  const { t } = useTranslation()
  const { savedProfiles } = useAppStore()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { periods, loading, error, expandedPaths } = useSelector((state: RootState) => state.dasha)

  const [selectedProfile, setSelectedProfile] = useState<ChartProfile | null>(null)
  const [calculatedProfileId, setCalculatedProfileId] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [manualData, setManualData] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
    time: "",
    location: null as { lat: number; lon: number; city: string } | null
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetDasha())
    }
  }, [dispatch])

  const handleCalculate = () => {
    if (!selectedProfile) {
        // Handle manual data if implemented
        return
    }
    
    setCalculatedProfileId(selectedProfile.id)
    dispatch(resetDasha())
    dispatch(fetchDashaPeriods({
        birthDetails: {
            date: selectedProfile.date,
            time: selectedProfile.time,
            lat: selectedProfile.location.lat,
            lon: selectedProfile.location.lon,
            timezone: "Asia/Kolkata" // Default or from profile
        },
        parentLords: []
    }))
  }

  const handleExpand = (path: string, lord: string, level: number) => {
    // Path format: "root" -> "Mars" -> "Mars-Venus"
    // If we are at root, path is "root". Item is "Mars". New path for children is "Mars".
    // If we are at "Mars", item is "Venus". New path is "Mars-Venus".
    
    // Actually, let's keep it simple.
    // The key in redux state is the parent chain joined by '-'.
    // Root key is "root".
    // Level 1 items are children of "root".
    // If I click "Mars" (Level 1), I want to fetch children for parentLords=["Mars"].
    // The key for these children will be "Mars".
    
    // If I click "Venus" (Level 2, under Mars), parentLords=["Mars", "Venus"].
    // Key will be "Mars-Venus".
    
    // So if I am rendering an item at `currentPath` (e.g. "root"), and the item lord is `lord` (e.g. "Mars").
    // The `nextPath` (key for its children) is:
    // If currentPath is "root", nextPath is `lord`.
    // Else, nextPath is `currentPath + "-" + lord`.
    
    const nextPath = path === "root" ? lord : `${path}-${lord}`;
    
    dispatch(togglePath(nextPath));
    
    // If not loaded, fetch
    if (!periods[nextPath] && !expandedPaths.includes(nextPath)) { // Only fetch if opening
         // Construct parent lords list from nextPath
         const parentLords = nextPath.split("-");
         
         dispatch(fetchDashaPeriods({
            birthDetails: {
                date: selectedProfile!.date,
                time: selectedProfile!.time,
                lat: selectedProfile!.location.lat,
                lon: selectedProfile!.location.lon,
                timezone: "Asia/Kolkata"
            },
            parentLords
        }))
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0a0a12]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-violet-300 hover:text-violet-100 transition-all text-sm font-medium group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {t('dasha.back', 'Go Back')}
            </button>
        </div>
        
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text text-transparent">
                {t('dasha.title', 'Vimshottari Dasha')}
              </span>
            </h1>
            <p className="text-violet-400/60 text-sm">{t('dasha.subtitle', 'Explore planetary periods up to 5 levels')}</p>
        </div>

        {/* Profile Selection */}
        <div className="max-w-xl mx-auto space-y-4">
             <div className="relative">
                <button
                    onClick={() => setShowSaved(!showSaved)}
                    className="w-full flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 hover:border-violet-500/30 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <User size={16} className="text-violet-400" />
                        {selectedProfile ? selectedProfile.name : t('dasha.choose_profile', 'Choose saved profile...')}
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
            
            <button
                onClick={handleCalculate}
                disabled={!selectedProfile || loading || (selectedProfile.id === calculatedProfileId)}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading && !periods['root'] ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Sparkles size={18} />
                        {t('dasha.calculate', 'Calculate Dasha')}
                    </>
                )}
            </button>
        </div>

        {/* Dasha List */}
        {periods['root'] && (
            <div className="space-y-2">
                <DashaList 
                    items={periods['root']} 
                    path="root" 
                    onExpand={handleExpand} 
                    expandedPaths={expandedPaths}
                    allPeriods={periods}
                    loading={loading}
                />
            </div>
        )}
      </div>
    </div>
  )
}

const PLANET_COLORS: Record<string, string> = {
    Sun: "text-amber-400",
    Moon: "text-slate-200",
    Mars: "text-rose-400",
    Mercury: "text-emerald-400",
    Jupiter: "text-yellow-400",
    Venus: "text-pink-300",
    Saturn: "text-blue-300",
    Rahu: "text-indigo-400",
    Ketu: "text-orange-400"
}

const PLANET_SHORT_NAMES: Record<string, string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
    Rahu: "Ra",
    Ketu: "Ke"
}

const DashaChain = ({ path, currentLord }: { path: string, currentLord: string }) => {
    const { t, i18n } = useTranslation()
    
    // Short Name Helper
    const getShortName = (name: string) => {
        const localized = t(`planets.${name}`, name)
        // If English, 2 chars. If Hindi, full name or 2 chars? Usually Hindi "सूर्य" is short enough.
        return i18n.language === 'hi' ? localized : localized.substring(0, 2)
    }

    if (path === "root") {
        return <span className={PLANET_COLORS[currentLord] || "text-slate-200"}>{t(`planets.${currentLord}`, currentLord)}</span>
    }
    
    // Path: "Mars-Rahu", Current: "Jupiter" -> "Mar-Rah-Jup"
    const parents = path.split("-");
    const chain = [...parents, currentLord];
    
    return (
        <div className="flex items-center gap-1">
            {chain.map((lord, idx) => (
                <React.Fragment key={idx}>
                    <span className={`${PLANET_COLORS[lord] || "text-slate-200"}`}>
                        {getShortName(lord)}
                    </span>
                    {idx < chain.length - 1 && (
                        <span className="text-slate-600">-</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

import { format } from "date-fns"

const formatDate = (dateStr: string) => {
    try {
        if (!dateStr) return ""
        return format(new Date(dateStr), "dd-MMM-yyyy")
    } catch (e) {
        return dateStr
    }
}

const DashaList = ({ 
    items, 
    path, 
    onExpand, 
    expandedPaths, 
    allPeriods,
    loading 
}: { 
    items: any[], 
    path: string, 
    onExpand: (path: string, lord: string, level: number) => void, 
    expandedPaths: string[],
    allPeriods: Record<string, any[]>,
    loading: boolean
}) => {
    const { t, i18n } = useTranslation()
    
    const getShortName = (name: string) => {
        const localized = t(`planets.${name}`, name)
        return i18n.language === 'hi' ? localized : localized.substring(0, 2)
    }

    return (
        <div className="space-y-2">
            {items.map((item, idx) => {
                const nextPath = path === "root" ? item.lord : `${path}-${item.lord}`;
                const isExpanded = expandedPaths.includes(nextPath);
                const children = allPeriods[nextPath];
                const hasChildren = item.level < 5; // Max 5 levels

                return (
                    <div key={idx} className={`rounded-xl overflow-hidden border border-slate-800/50 ${
                        item.level === 1 ? "bg-slate-900/40" : "bg-slate-900" // Use solid bg for nested to prevent fade
                    }`}>
                        <button
                            onClick={() => hasChildren && onExpand(path, item.lord, item.level)}
                            className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                                isExpanded ? "bg-slate-800/50" : "hover:bg-slate-800/30"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                    item.level === 1 ? "bg-violet-500/20 text-violet-300" : "bg-slate-800 text-slate-400"
                                }`}>
                                    {getShortName(item.lord)}
                                </div>
                                <div>
                                    <div className="text-slate-200 font-medium">
                                        <DashaChain path={path} currentLord={item.lord} />
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            {formatDate(item.start)}
                                        </span>
                                        <span>→</span>
                                        <span className="flex items-center gap-1">
                                            {formatDate(item.end)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {hasChildren && (
                                <ChevronDown 
                                    size={16} 
                                    className={`text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                                />
                            )}
                        </button>
                        
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-800/50"
                                >
                                    <div className="p-2 pl-6">
                                        {children ? (
                                            <DashaList 
                                                items={children} 
                                                path={nextPath} 
                                                onExpand={onExpand} 
                                                expandedPaths={expandedPaths}
                                                allPeriods={allPeriods}
                                                loading={loading}
                                            />
                                        ) : (
                                            <div className="p-4 text-center">
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
                                                ) : (
                                                    <span className="text-xs text-slate-500">{t('dasha.no_sub_periods', 'No sub-periods found')}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}
