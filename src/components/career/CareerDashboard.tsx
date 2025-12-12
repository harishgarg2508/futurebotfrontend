"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchCareerPrediction } from "@/redux/slices/careerSlice"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronDown, RefreshCw, Zap, AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import HeroReveal from "./HeroReveal"
import DestinyStack from "./DestinyStack"
import OracleVerdict from "./OracleVerdict"
import FloatingStars from "@/components/onboarding/FloatingStars"

interface Profile {
  id: string
  name: string
  date: string
  time: string
  location: {
    lat: number
    lon: number
    timezone: string
  }
}

const DNALoader = () => {
  const helixLength = 20
  const radius = 40
  const verticalSpacing = 18

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] relative"
    >
      {/* Deep space background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[80px]" />
      </div>

      {/* Floating molecular structures - background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Hexagonal molecules */}
        {[...Array(8)].map((_, i) => (
          <motion.svg
            key={`hex-${i}`}
            className="absolute text-blue-400/20"
            width="60"
            height="60"
            viewBox="0 0 60 60"
            style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${15 + Math.floor(i / 4) * 60}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          >
            <polygon points="30,5 55,20 55,45 30,60 5,45 5,20" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="5" r="3" fill="currentColor" />
            <circle cx="55" cy="20" r="3" fill="currentColor" />
            <circle cx="55" cy="45" r="3" fill="currentColor" />
            <circle cx="30" cy="60" r="3" fill="currentColor" />
            <circle cx="5" cy="45" r="3" fill="currentColor" />
            <circle cx="5" cy="20" r="3" fill="currentColor" />
          </motion.svg>
        ))}
      </div>

      {/* Main DNA Helix Container */}
      <div className="relative w-[200px] h-[400px] perspective-[1000px]">
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {/* SVG Filters for enhanced glow */}
          <svg className="absolute" width="0" height="0">
            <defs>
              <filter id="dna-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="strand-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <radialGradient id="node-glow">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
            </defs>
          </svg>

          {/* DNA Helix pairs */}
          {[...Array(helixLength)].map((_, i) => {
            const angle = (i / helixLength) * Math.PI * 4
            const yPos = i * verticalSpacing
            const x1 = Math.cos(angle) * radius + 100
            const x2 = Math.cos(angle + Math.PI) * radius + 100
            const z1 = Math.sin(angle) * radius
            const z2 = Math.sin(angle + Math.PI) * radius
            const opacity1 = 0.4 + (Math.sin(angle) + 1) * 0.3
            const opacity2 = 0.4 + (Math.sin(angle + Math.PI) + 1) * 0.3

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: yPos,
                  width: "100%",
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.1,
                }}
              >
                {/* Connection bar (base pair) */}
                <motion.div
                  className="absolute h-[3px] rounded-full"
                  style={{
                    left: Math.min(x1, x2),
                    width: Math.abs(x2 - x1),
                    top: 0,
                    background: `linear-gradient(90deg, 
                      rgba(6, 182, 212, ${opacity1}) 0%, 
                      rgba(59, 130, 246, 0.8) 50%, 
                      rgba(6, 182, 212, ${opacity2}) 100%)`,
                    boxShadow: `0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)`,
                    transform: `translateZ(${(z1 + z2) / 2}px)`,
                  }}
                />

                {/* Left node (phosphate) */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: x1 - 8,
                    top: -8,
                    width: 16,
                    height: 16,
                    background: `radial-gradient(circle at 30% 30%, #67e8f9, #0891b2)`,
                    boxShadow: `0 0 15px rgba(6, 182, 212, ${opacity1}), 0 0 30px rgba(6, 182, 212, 0.4), inset 0 0 10px rgba(255,255,255,0.3)`,
                    transform: `translateZ(${z1}px)`,
                    opacity: opacity1,
                  }}
                />

                {/* Right node (phosphate) */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: x2 - 8,
                    top: -8,
                    width: 16,
                    height: 16,
                    background: `radial-gradient(circle at 30% 30%, #93c5fd, #2563eb)`,
                    boxShadow: `0 0 15px rgba(59, 130, 246, ${opacity2}), 0 0 30px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(255,255,255,0.3)`,
                    transform: `translateZ(${z2}px)`,
                    opacity: opacity2,
                  }}
                />

                {/* Center nucleotide markers */}
                {i % 2 === 0 && (
                  <>
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        left: (x1 + x2) / 2 - 10,
                        top: -4,
                        width: 8,
                        height: 8,
                        background: "rgba(34, 211, 238, 0.6)",
                        boxShadow: "0 0 8px rgba(34, 211, 238, 0.8)",
                        transform: `translateZ(${(z1 + z2) / 2}px)`,
                      }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.05 }}
                    />
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        left: (x1 + x2) / 2 + 4,
                        top: -4,
                        width: 8,
                        height: 8,
                        background: "rgba(96, 165, 250, 0.6)",
                        boxShadow: "0 0 8px rgba(96, 165, 250, 0.8)",
                        transform: `translateZ(${(z1 + z2) / 2}px)`,
                      }}
                      animate={{ scale: [1.3, 1, 1.3] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.05 }}
                    />
                  </>
                )}
              </motion.div>
            )
          })}

          {/* Backbone strands (continuous helix lines) */}
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: "translateZ(0)" }}
            viewBox="0 0 200 400"
          >
            <defs>
              <filter id="backbone-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Left backbone */}
            <path
              d={[...Array(helixLength)]
                .map((_, i) => {
                  const angle = (i / helixLength) * Math.PI * 4
                  const x = Math.cos(angle) * radius + 100
                  const y = i * verticalSpacing
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}
              fill="none"
              stroke="url(#strand-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#backbone-glow)"
              opacity="0.8"
            />
            {/* Right backbone */}
            <path
              d={[...Array(helixLength)]
                .map((_, i) => {
                  const angle = (i / helixLength) * Math.PI * 4 + Math.PI
                  const x = Math.cos(angle) * radius + 100
                  const y = i * verticalSpacing
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}
              fill="none"
              stroke="url(#strand-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#backbone-glow)"
              opacity="0.8"
            />
          </svg>
        </motion.div>

        {/* Scanning beam effect */}
        <motion.div
          className="absolute left-0 right-0 h-2 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.6), transparent)",
            boxShadow: "0 0 30px rgba(34, 211, 238, 0.5)",
          }}
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {/* Loading Text */}
      <motion.div
        className="mt-10 text-center z-10"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <p className="text-cyan-400 font-semibold text-xl tracking-wide">Decoding Career DNA</p>
        <motion.p
          className="text-blue-400/60 text-sm mt-2"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          Analyzing cosmic patterns...
        </motion.p>
      </motion.div>

      {/* Particle effects */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-cyan-400"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 60}%`,
            boxShadow: "0 0 6px rgba(34, 211, 238, 0.8)",
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  )
}

const CareerDashboard = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { currentPrediction, loading, error } = useSelector((state: RootState) => state.career)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>("")
  const [fetchingProfiles, setFetchingProfiles] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [showLoader, setShowLoader] = useState(false)
  const loadingStartTime = useRef<number>(0)

  // 1. Fetch Profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "profiles"))
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as unknown as Profile[]
        setProfiles(data)
      } catch (e) {
        console.error("Error fetching profiles", e)
      } finally {
        setFetchingProfiles(false)
      }
    }
    fetchProfiles()
  }, [user])

  useEffect(() => {
    if (loading) {
      loadingStartTime.current = Date.now()
      setShowLoader(true)
    } else if (loadingStartTime.current > 0) {
      const elapsed = Date.now() - loadingStartTime.current
      const minDisplayTime = 3000 // 3 seconds minimum
      const remainingTime = Math.max(0, minDisplayTime - elapsed)

      setTimeout(() => {
        setShowLoader(false)
      }, remainingTime)
    }
  }, [loading])

  // 2. Handle Profile Selection & Prediction
  const handleGenerate = () => {
    if (!selectedProfileId) return
    const profile = profiles.find((p) => p.id === selectedProfileId)
    if (!profile) return

    dispatch(
      fetchCareerPrediction({
        date: profile.date,
        time: profile.time,
        lat: profile.location.lat,
        lon: profile.location.lon,
        timezone: profile.location.timezone,
        name: profile.name,
        language: i18n.language || "hi",
      }),
    )
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  const isDisplayingLoader = showLoader || loading

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-light)] p-6 md:p-12 relative overflow-hidden">
      <FloatingStars />

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-lavender)]/10 backdrop-blur-sm border border-[var(--color-lavender)]/20 text-[var(--color-lavender)] text-xs font-medium tracking-widest uppercase mb-6"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>Cosmic Career Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[var(--color-lavender)] via-[var(--color-violet)] to-[var(--color-lavender)] bg-clip-text text-transparent mb-4 leading-tight"
        >
          Decode Your Destiny
        </motion.h1>

        <p className="text-[var(--color-lavender)]/70 max-w-2xl mx-auto text-lg font-light tracking-wide">
          Unlock the cosmic blueprint of your professional journey
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-16 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-lavender)] to-[var(--color-violet)] rounded-2xl blur opacity-30"></div>

          <div className="relative serene-glass rounded-2xl p-2 flex flex-col sm:flex-row items-stretch gap-2 shadow-2xl">
            {/* Custom Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full bg-white/5 hover:bg-white/10 text-[var(--color-light)] px-6 py-4 rounded-xl flex items-center justify-between transition-all border border-white/5 hover:border-[var(--color-lavender)]/30 group"
                disabled={fetchingProfiles}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-[var(--color-lavender)]/60 uppercase tracking-wider font-medium mb-1">
                    Selected Profile
                  </span>
                  <span
                    className={`font-medium text-lg ${selectedProfile ? "text-[var(--color-light)]" : "text-[var(--color-light)]/40"}`}
                  >
                    {selectedProfile ? selectedProfile.name : "Select your chart..."}
                  </span>
                </div>
                <ChevronDown
                  className={`text-[var(--color-lavender)]/50 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  size={20}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a0a2e]/95 backdrop-blur-xl border border-[var(--color-lavender)]/20 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {profiles.length > 0 ? (
                        profiles.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedProfileId(p.id)
                              setIsDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group ${
                              selectedProfileId === p.id
                                ? "bg-[var(--color-lavender)]/20 text-[var(--color-light)] border border-[var(--color-lavender)]/30"
                                : "hover:bg-white/5 text-[var(--color-lavender)]/70 hover:text-[var(--color-light)]"
                            }`}
                          >
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs opacity-60">{p.date}</div>
                            </div>
                            {selectedProfileId === p.id && (
                              <Sparkles size={14} className="text-[var(--color-rose)] animate-pulse" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-[var(--color-light)]/40 italic text-sm">
                          No profiles found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedProfileId || loading}
              className="btn-celestial px-8 py-4 rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Zap size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />
              )}
              <span>REVEAL DESTINY</span>
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-[var(--color-light)]/20 font-mono">
            Language: {i18n.language || "undefined"}
          </div>
        </motion.div>
      </div>

      {/* Results Area */}
      <div className="max-w-6xl mx-auto relative min-h-[400px] z-10">
        <AnimatePresence mode="wait">
          {isDisplayingLoader && <DNALoader key="loader" />}

          {!isDisplayingLoader && currentPrediction && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {/* 1. Hero Reveal */}
              <HeroReveal
                archetype={currentPrediction.hero_stats.primary_archetype}
                score={currentPrediction.hero_stats.confidence_score}
                topCategory={currentPrediction.hero_stats.top_category}
              />

              {/* 2. Destiny Stack (Probability Matrix) */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-lavender)]/30 to-transparent"></div>
                  <h3 className="text-[var(--color-lavender)]/80 font-medium text-sm tracking-widest uppercase">
                    Career Pathways
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--color-lavender)]/30 to-transparent"></div>
                </div>
                <DestinyStack data={currentPrediction.career_matrix} />
              </section>

              {/* 3. Oracle's Verdict */}
              <section>
                <OracleVerdict verdict={currentPrediction.oracle_verdict} />
              </section>
            </motion.div>
          )}

          {!isDisplayingLoader && !currentPrediction && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--color-lavender)]/40 mt-32 font-light italic"
            >
              Select a birth chart to reveal your cosmic career path
            </motion.div>
          )}

          {error && !isDisplayingLoader && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-20 max-w-md mx-auto"
            >
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 p-8 rounded-2xl">
                <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
                <p className="text-red-300">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CareerDashboard
