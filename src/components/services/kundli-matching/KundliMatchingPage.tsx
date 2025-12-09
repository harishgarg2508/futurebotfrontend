"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useAppStore, type ChartProfile } from "@/lib/store"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  User,
  Users,
  Sparkles,
  ChevronDown,
  X,
  Check,
  MapPin,
  Calendar,
  Clock,
  Search,
  RotateCcw,
  ArrowLeft,
} from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchMatchMaking, clearMatchResult } from "@/redux/slices/matchSlice"
import type { RootState, AppDispatch } from "@/redux/store"

// Mini North Indian Chart for display
const MiniChart: React.FC<{ planets: Record<string, any>; ascendantSignId: number; label: string }> = ({
  planets,
  ascendantSignId,
  label,
}) => {
  const { t, i18n } = useTranslation()
  const planetColors: Record<string, string> = {
    Su: "#FFD700",
    Mo: "#E8E8E8",
    Ma: "#FF6B6B",
    Me: "#90EE90",
    Ju: "#FFB347",
    Ve: "#FF69B4",
    Sa: "#8B8BB0",
    Ra: "#6B5B95",
    Ke: "#708090",
  }

  const housePlanets: Record<number, string[]> = {}
  Object.entries(planets).forEach(([name, data]: [string, any]) => {
    const pSignId = data.sign_id
    if (!pSignId || !ascendantSignId) return
    const houseNum = ((pSignId - ascendantSignId + 12) % 12) + 1
    if (!housePlanets[houseNum]) housePlanets[houseNum] = []
    let lbl = name.substring(0, 2)
    if (data.is_retrograde) lbl += "ᴿ"
    housePlanets[houseNum].push(lbl)
  })

  const renderPlanets = (houseNum: number, x: number, y: number) => {
    const list = housePlanets[houseNum] || []
    // Center the group vertically based on number of planets
    const startY = y - ((list.length - 1) * 8) / 2
    
    return list.map((p, i) => {
      const base = p.replace("ᴿ", "")
      const localized = t(`planets.${base}`, base)
      const displayLabel = i18n.language === 'hi' ? localized : base
      
      return (
        <text
          key={p}
          x={x}
          y={startY + i * 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[7px] font-bold"
          style={{ fill: planetColors[base] || "#C4B5FD" }}
        >
          {displayLabel}{p.includes("ᴿ") && "ᴿ"}
        </text>
      )
    })
  }

  // Sanitize label for ID
  const safeLabel = label.replace(/[^a-zA-Z0-9]/g, "")

  return (
    <div className="relative">
      <div className="text-[10px] text-center mb-2 text-violet-300/70 uppercase tracking-wider font-medium">
        {label}
      </div>
      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-slate-900/90 via-violet-950/70 to-slate-900/90 border border-violet-400/20 p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id={`line-${safeLabel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" fill="none" stroke={`url(#line-${safeLabel})`} strokeWidth="1" rx="2" />
          <line x1="2" y1="2" x2="98" y2="98" stroke={`url(#line-${safeLabel})`} strokeWidth="0.8" />
          <line x1="98" y1="2" x2="2" y2="98" stroke={`url(#line-${safeLabel})`} strokeWidth="0.8" />
          <line x1="50" y1="2" x2="2" y2="50" stroke={`url(#line-${safeLabel})`} strokeWidth="0.8" />
          <line x1="2" y1="50" x2="50" y2="98" stroke={`url(#line-${safeLabel})`} strokeWidth="0.8" />
          <line x1="50" y1="98" x2="98" y2="50" stroke={`url(#line-${safeLabel})`} strokeWidth="0.8" />
          <line x1="98" y1="50" x2="50" y2="2" stroke={`url(#line-${safeLabel})`} strokeWidth="0.8" />
          
          {/* House 1 (Top Diamond) */}
          {renderPlanets(1, 50, 25)}
          {/* House 2 (Top Left) */}
          {renderPlanets(2, 25, 15)}
          {/* House 3 (Left Top) */}
          {renderPlanets(3, 15, 25)}
          {/* House 4 (Left Diamond) */}
          {renderPlanets(4, 25, 50)}
          {/* House 5 (Left Bottom) */}
          {renderPlanets(5, 15, 75)}
          {/* House 6 (Bottom Left) */}
          {renderPlanets(6, 25, 85)}
          {/* House 7 (Bottom Diamond) */}
          {renderPlanets(7, 50, 75)}
          {/* House 8 (Bottom Right) */}
          {renderPlanets(8, 75, 85)}
          {/* House 9 (Right Bottom) */}
          {renderPlanets(9, 85, 75)}
          {/* House 10 (Right Diamond) */}
          {renderPlanets(10, 75, 50)}
          {/* House 11 (Right Top) */}
          {renderPlanets(11, 85, 25)}
          {/* House 12 (Top Right) */}
          {renderPlanets(12, 75, 15)}
        </svg>
      </div>
    </div>
  )
}

// Birth data form component
interface BirthFormData {
  name: string
  day: string
  month: string
  year: string
  time: string
  location: { lat: number; lon: number; city: string } | null
}

const BirthDataForm: React.FC<{
  label: string
  icon: React.ReactNode
  color: string
  data: BirthFormData
  onChange: (data: BirthFormData) => void
  savedCharts: ChartProfile[]
  onSelectSaved: (chart: ChartProfile) => void
}> = ({ label, icon, color, data, onChange, savedCharts, onSelectSaved }) => {
  const [showSaved, setShowSaved] = useState(false)
  const [locQuery, setLocQuery] = useState("")
  const [locResults, setLocResults] = useState<any[]>([])
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locQuery.length >= 3) {
        searchLocation(locQuery)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [locQuery])

  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ]

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

  return (
    <div className="relative flex-1 min-w-[280px]">
      {/* Header */}
      <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-${color}-400/20`}>
        <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-400/20`}>{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-slate-200">{label}</h3>
          <p className="text-[10px] text-slate-400">Birth details</p>
        </div>
        {savedCharts.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="ml-auto text-[10px] px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-colors flex items-center gap-1"
          >
            <Users size={10} />
            Saved
            <ChevronDown size={10} className={`transition-transform ${showSaved ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Saved charts dropdown */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-2 rounded-xl bg-violet-950/30 border border-violet-400/10 max-h-32 overflow-y-auto custom-scrollbar">
              {savedCharts.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => {
                    onSelectSaved(chart)
                    setShowSaved(false)
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-violet-500/10 transition-colors text-sm text-slate-300 flex items-center gap-2"
                >
                  <User size={12} className="text-violet-400" />
                  <span>{chart.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{chart.location?.city}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form fields */}
      <div className="space-y-3">
        {/* Name */}
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Name"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition-colors"
          />
        </div>

        {/* Date */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              placeholder="DD"
              min="1"
              max="31"
              value={data.day}
              onChange={(e) => onChange({ ...data, day: e.target.value })}
              className="w-full pl-8 pr-2 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-center text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition-colors"
            />
          </div>
          <select
            value={data.month}
            onChange={(e) => onChange({ ...data, month: e.target.value })}
            className="flex-[2] px-2 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-violet-400/40 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900">
              Month
            </option>
            {months.map((m) => (
              <option key={m.value} value={m.value} className="bg-slate-900">
                {m.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="YYYY"
            min="1900"
            max="2100"
            value={data.year}
            onChange={(e) => onChange({ ...data, year: e.target.value })}
            className="flex-[1.5] px-2 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-center text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition-colors"
          />
        </div>

        {/* Time */}
        <div className="relative">
          <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="time"
            value={data.time}
            onChange={(e) => onChange({ ...data, time: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-violet-400/40 transition-colors"
            style={{ colorScheme: "dark" }}
          />
        </div>

        {/* Location */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search birth city..."
            value={locQuery}
            onChange={(e) => {
              setLocQuery(e.target.value)
              // Search triggered by effect
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition-colors"
          />
          {loadingLoc && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
            </div>
          )}
          <AnimatePresence>
            {locResults.length > 0 && !data.location && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 w-full mt-1 bg-slate-900/95 backdrop-blur-xl border border-violet-400/20 rounded-xl shadow-xl max-h-36 overflow-y-auto z-20 custom-scrollbar"
              >
                {locResults.map((res) => (
                  <button
                    key={res.place_id}
                    onClick={() => {
                      onChange({
                        ...data,
                        location: {
                          lat: Number.parseFloat(res.lat),
                          lon: Number.parseFloat(res.lon),
                          city: res.display_name.split(",")[0],
                        },
                      })
                      setLocQuery(res.display_name.split(",")[0])
                      setLocResults([])
                    }}
                    className="w-full text-left p-3 text-xs text-slate-300 hover:bg-violet-500/10 transition-colors border-b border-slate-700/30 last:border-0"
                  >
                    {res.display_name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {data.location && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs"
          >
            <MapPin size={12} className="text-emerald-400" />
            <span className="text-emerald-300 truncate flex-1">{data.location.city}</span>
            <button
              onClick={() => {
                onChange({ ...data, location: null })
                setLocQuery("")
              }}
              className="text-rose-400 hover:text-rose-300"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Guna matching result data
interface GunaResult {
  name: string
  maxScore: number
  score: number
  description: string
}

// Main Kundli Matching Page
export const KundliMatchingPage: React.FC = () => {
  const { t } = useTranslation()
  const { savedProfiles: profiles } = useAppStore()
  const router = useRouter()

  const dispatch = useDispatch<AppDispatch>()
  const { result: matchResult, loading: matchLoading, error: matchError } = useSelector((state: RootState) => state.match)

  const [maleData, setMaleData] = useState<BirthFormData>({
    name: "",
    day: "",
    month: "",
    year: "",
    time: "",
    location: null,
  })
  const [femaleData, setFemaleData] = useState<BirthFormData>({
    name: "",
    day: "",
    month: "",
    year: "",
    time: "",
    location: null,
  })

  const [maleChart, setMaleChart] = useState<any>(null)
  const [femaleChart, setFemaleChart] = useState<any>(null)
  // const [loading, setLoading] = useState(false) // Use Redux loading
  // const [results, setResults] = useState<GunaResult[] | null>(null) // Derived from Redux
  // const [totalScore, setTotalScore] = useState(0) // Derived from Redux

  const handleSelectSaved = (chart: ChartProfile, isMale: boolean) => {
    const dateParts = chart.date.split("-")
    const formData: BirthFormData = {
      name: chart.name,
      year: dateParts[0] || "",
      month: dateParts[1] || "",
      day: dateParts[2] || "",
      time: chart.time,
      location: chart.location,
    }
    if (isMale) setMaleData(formData)
    else setFemaleData(formData)
  }

  const isFormValid = useCallback((data: BirthFormData) => {
    return data.name && data.day && data.month && data.year && data.time && data.location
  }, [])

  const calculateMatch = async () => {
    if (!isFormValid(maleData) || !isFormValid(femaleData)) {
      alert("Please fill all details for both partners")
      return
    }

    // setLoading(true)
    // setResults(null)
    dispatch(clearMatchResult())

    try {
      const { getBirthChart } = await import("@/services/api/birthChart")

      const [mChart, fChart] = await Promise.all([
        getBirthChart({
          date: `${maleData.year}-${maleData.month}-${maleData.day.padStart(2, "0")}`,
          time: maleData.time,
          lat: maleData.location!.lat,
          lon: maleData.location!.lon,
        }),
        getBirthChart({
          date: `${femaleData.year}-${femaleData.month}-${femaleData.day.padStart(2, "0")}`,
          time: femaleData.time,
          lat: femaleData.location!.lat,
          lon: femaleData.location!.lon,
        }),
      ])

      setMaleChart(mChart)
      setFemaleChart(fChart)

      // Dispatch Redux Action
      await dispatch(fetchMatchMaking({
        boy_date: `${maleData.year}-${maleData.month}-${maleData.day.padStart(2, "0")}`,
        boy_time: maleData.time,
        girl_date: `${femaleData.year}-${femaleData.month}-${femaleData.day.padStart(2, "0")}`,
        girl_time: femaleData.time,
      })).unwrap()

    } catch (err) {
      console.error(err)
      alert("Failed to calculate. Please try again.")
    } finally {
      // setLoading(false)
    }
  }

  const resetForm = () => {
    setMaleData({ name: "", day: "", month: "", year: "", time: "", location: null })
    setFemaleData({ name: "", day: "", month: "", year: "", time: "", location: null })
    setMaleChart(null)
    setFemaleChart(null)
    dispatch(clearMatchResult())
  }

  // Derive results from Redux state
  const results: GunaResult[] | null = matchResult ? [
    { name: "Varna", maxScore: 1, score: matchResult.details.varna, description: "Spiritual compatibility" },
    { name: "Vashya", maxScore: 2, score: matchResult.details.vashya, description: "Mutual attraction & control" },
    { name: "Tara", maxScore: 3, score: matchResult.details.tara, description: "Birth star compatibility" },
    { name: "Yoni", maxScore: 4, score: matchResult.details.yoni, description: "Physical & sexual compatibility" },
    { name: "Graha Maitri", maxScore: 5, score: matchResult.details.graha_maitri, description: "Mental compatibility" },
    { name: "Gana", maxScore: 6, score: matchResult.details.gana, description: "Temperament match" },
    { name: "Bhakoot", maxScore: 7, score: matchResult.details.bhakoot, description: matchResult.bhakoot_reason || "Love & family life" },
    { name: "Nadi", maxScore: 8, score: matchResult.details.nadi, description: "Health & genes" },
  ] : null

  const totalScore = matchResult ? matchResult.total_score : 0

  const getCompatibilityLevel = (score: number) => {
    if (score >= 28) return { label: "Excellent", color: "emerald", emoji: "💫" }
    if (score >= 21) return { label: "Good", color: "violet", emoji: "✨" }
    if (score >= 14) return { label: "Average", color: "amber", emoji: "🌟" }
    return { label: "Below Average", color: "rose", emoji: "💫" }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 relative">
          <button
            onClick={() => {
              if (maleChart && femaleChart) {
                setMaleChart(null)
                setFemaleChart(null)
                dispatch(clearMatchResult())
              } else {
                router.push("/")
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 px-4 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-xl text-violet-300 hover:text-violet-100 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:inline text-sm font-medium">{t('dasha.back', 'Go Back')}</span>
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-400/20 text-rose-300 text-xs font-medium">
            <Heart size={12} className="animate-pulse" />
            {t('services.kundli-matching.title', 'Kundli Matching')}
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-violet-200 via-rose-200 to-amber-200 bg-clip-text text-transparent">
            {t('matching.title', 'Ashtakoot Guna Milan')}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {t('matching.subtitle', 'Calculate the compatibility score between two birth charts based on Vedic astrology principles')}
          </p>
        </motion.div>

        {/* Charts display when processed */}
        <AnimatePresence mode="wait">
          {maleChart && femaleChart ? (
            <motion.div
              key="charts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-wrap justify-center items-center gap-8 py-6"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <MiniChart
                  planets={maleChart.planets}
                  ascendantSignId={maleChart.ascendant?.sign_id || 1}
                  label={maleData.name || "Male"}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-violet-500/20 border border-rose-400/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-400" fill="currentColor" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-rose-400/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <MiniChart
                  planets={femaleChart.planets}
                  ascendantSignId={femaleChart.ascendant?.sign_id || 1}
                  label={femaleData.name || "Female"}
                />
              </motion.div>

              <button
                onClick={resetForm}
                className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="forms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="serene-glass rounded-2xl p-5 md:p-6"
            >
              <div className="flex flex-wrap gap-6 md:gap-8">
                <BirthDataForm
                  label="Male Partner"
                  icon={<User size={16} className="text-blue-400" />}
                  color="blue"
                  data={maleData}
                  onChange={setMaleData}
                  savedCharts={profiles}
                  onSelectSaved={(chart) => handleSelectSaved(chart, true)}
                />

                {/* Divider */}
                <div className="hidden md:flex flex-col items-center justify-center px-2">
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-violet-400/30 to-transparent" />
                  <Heart size={16} className="text-rose-400/50 my-4" />
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-violet-400/30 to-transparent" />
                </div>

                <BirthDataForm
                  label="Female Partner"
                  icon={<User size={16} className="text-rose-400" />}
                  color="rose"
                  data={femaleData}
                  onChange={setFemaleData}
                  savedCharts={profiles}
                  onSelectSaved={(chart) => handleSelectSaved(chart, false)}
                />
              </div>

              <motion.button
                onClick={calculateMatch}
                disabled={matchLoading || !isFormValid(maleData) || !isFormValid(femaleData)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-violet-500 via-rose-500 to-violet-500 bg-[length:200%_100%] text-white font-medium rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:bg-right"
                style={{ backgroundPosition: matchLoading ? "right" : "left" }}
              >
                {matchLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating Compatibility...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Calculate Match
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="space-y-4"
            >
              {/* Score card */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={`serene-glass rounded-2xl p-6 text-center border-${getCompatibilityLevel(totalScore).color}-400/20`}
              >
                <div className="text-4xl mb-2">{getCompatibilityLevel(totalScore).emoji}</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-300 via-rose-300 to-amber-300 bg-clip-text text-transparent mb-2">
                  {totalScore}/36
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-${getCompatibilityLevel(totalScore).color}-500/10 border border-${getCompatibilityLevel(totalScore).color}-400/20 text-${getCompatibilityLevel(totalScore).color}-300 text-sm font-medium`}
                >
                  <Check size={14} />
                  {getCompatibilityLevel(totalScore).label} Match
                </div>
              </motion.div>

              {/* Detailed results table */}
              <div className="serene-glass rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-gradient-to-r from-violet-500/10 via-rose-500/10 to-amber-500/10 border-b border-violet-400/10">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-300/80">
                    {t('matching.detailed_analysis', 'Detailed Guna Analysis')}
                  </span>
                </div>
                <div className="p-2">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold text-left">
                          {t('matching.columns.guna', 'Guna')}
                        </th>
                        <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold text-left hidden md:table-cell">
                          {t('matching.columns.aspect', 'Aspect')}
                        </th>
                        <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold text-center">
                          {t('matching.columns.score', 'Score')}
                        </th>
                        <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold text-right">
                          {t('matching.columns.status', 'Status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-400/10">
                      {results.map((guna, index) => {
                        const percentage = (guna.score / guna.maxScore) * 100
                        return (
                          <motion.tr
                            key={guna.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="hover:bg-violet-500/5 transition-colors"
                          >
                              <td className="py-3 px-4">
                              <span className="text-sm font-medium text-slate-200">
                                {t(`matching.guna_type.${guna.name.toLowerCase().replace(' ', '_')}`, guna.name)}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <span className="text-xs text-slate-400">
                                {t(`matching.description.${guna.name.toLowerCase().replace(' ', '_')}`, guna.description)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                                    className={`h-full rounded-full ${percentage >= 70 ? "bg-emerald-400" : percentage >= 40 ? "bg-amber-400" : "bg-rose-400"}`}
                                  />
                                </div>
                                <span className="text-sm font-mono text-slate-300">
                                  {guna.score}/{guna.maxScore}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {percentage >= 70 ? (
                                <span className="text-emerald-400 text-xs">{t('matching.status.excellent', 'Excellent')}</span>
                              ) : percentage >= 40 ? (
                                <span className="text-amber-400 text-xs">{t('matching.status.good', 'Good')}</span>
                              ) : (
                                <span className="text-rose-400 text-xs">{t('matching.status.low', 'Low')}</span>
                              )}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default KundliMatchingPage
