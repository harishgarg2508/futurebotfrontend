"use client"

import { useEffect, useState } from "react"
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

const CareerDashboard = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { currentPrediction, loading, error } = useSelector((state: RootState) => state.career)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>("")
  const [fetchingProfiles, setFetchingProfiles] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
        language: i18n.language || 'hi',
      }),
    )
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

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
                  <span className={`font-medium text-lg ${selectedProfile ? "text-[var(--color-light)]" : "text-[var(--color-light)]/40"}`}>
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
                        <div className="px-4 py-3 text-center text-[var(--color-light)]/40 italic text-sm">No profiles found</div>
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
            Language: {i18n.language || 'undefined'}
          </div>
        </motion.div>
      </div>

      {/* Results Area */}
      <div className="max-w-6xl mx-auto relative min-h-[400px] z-10">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[500px] relative"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-cyan-500/5 to-blue-500/5 animate-pulse" />

              {/* DNA Container */}
              <div className="relative w-64 h-96">
                {/* SVG Filters for neon glow */}
                <svg className="absolute inset-0" width="0" height="0">
                  <defs>
                    <filter id="neon-glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>

                {/* Left DNA Strand */}
                <motion.div
                  className="absolute left-[35%] top-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-blue-400 to-cyan-400 rounded-full"
                  style={{ filter: "url(#neon-glow)" }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Right DNA Strand */}
                <motion.div
                  className="absolute right-[35%] top-0 w-1 h-full bg-gradient-to-b from-blue-400 via-cyan-400 to-blue-400 rounded-full"
                  style={{ filter: "url(#neon-glow)" }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />

                {/* Base Pair Connections */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400"
                    style={{
                      left: "35%",
                      right: "35%",
                      top: `${8 + i * 7}%`,
                      filter: "url(#neon-glow)",
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    {/* Connection nodes */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                  </motion.div>
                ))}

                {/* Floating Molecules */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`mol-${i}`}
                    className="absolute"
                    style={{
                      left: `${i % 2 === 0 ? "10%" : "75%"}`,
                      top: `${15 + i * 15}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-cyan-400/40 shadow-lg shadow-cyan-400/30" />
                  </motion.div>
                ))}

                {/* Scanning Beam */}
                <motion.div
                  className="absolute left-[20%] right-[20%] h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  style={{ filter: "blur(4px)" }}
                  animate={{
                    top: ["0%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Loading Text */}
              <motion.div
                className="mt-8 text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-cyan-400 font-medium text-lg">Decoding Career DNA</p>
                <p className="text-cyan-400/60 text-sm mt-2">Analyzing cosmic patterns...</p>
              </motion.div>
            </motion.div>
          )}

          {!loading && currentPrediction && (
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
                  <h3 className="text-[var(--color-lavender)]/80 font-medium text-sm tracking-widest uppercase">Career Pathways</h3>
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

          {!loading && !currentPrediction && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--color-lavender)]/40 mt-32 font-light italic"
            >
              Select a birth chart to reveal your cosmic career path
            </motion.div>
          )}

          {error && (
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
