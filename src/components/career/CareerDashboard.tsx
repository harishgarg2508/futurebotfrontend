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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white p-6 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 backdrop-blur-sm border border-violet-400/20 text-violet-300 text-xs font-medium tracking-widest uppercase mb-6"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>Cosmic Career Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent mb-4 leading-tight"
        >
          Decode Your Destiny
        </motion.h1>

        <p className="text-violet-300/70 max-w-2xl mx-auto text-lg">
          Unlock the cosmic blueprint of your professional journey
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-16 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 rounded-2xl blur opacity-30"></div>

          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row items-stretch gap-2 shadow-2xl">
            {/* Custom Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl flex items-center justify-between transition-all border border-white/5 hover:border-violet-400/30 group"
                disabled={fetchingProfiles}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-violet-400/60 uppercase tracking-wider font-medium mb-1">
                    Selected Profile
                  </span>
                  <span className={`font-medium text-lg ${selectedProfile ? "text-white" : "text-white/40"}`}>
                    {selectedProfile ? selectedProfile.name : "Select your chart..."}
                  </span>
                </div>
                <ChevronDown
                  className={`text-violet-400/50 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  size={20}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a0a2e]/95 backdrop-blur-xl border border-violet-500/20 rounded-xl shadow-2xl overflow-hidden z-50"
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
                                ? "bg-violet-500/20 text-white border border-violet-500/30"
                                : "hover:bg-white/5 text-violet-200/70 hover:text-white"
                            }`}
                          >
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs opacity-60">{p.date}</div>
                            </div>
                            {selectedProfileId === p.id && (
                              <Sparkles size={14} className="text-fuchsia-400 animate-pulse" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-white/40 italic text-sm">No profiles found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedProfileId || loading}
              className="px-8 py-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 hover:from-violet-400 hover:via-fuchsia-400 hover:to-rose-400 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Zap size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />
              )}
              <span>REVEAL DESTINY</span>
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-white/20 font-mono">
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
              className="absolute inset-0 flex flex-col items-center justify-center text-center pt-20"
            >
              <div className="relative w-40 h-72 mb-12">
                <svg className="w-full h-full" viewBox="0 0 120 220">
                  {/* Left Strand with enhanced glow */}
                  <motion.path
                    d="M 35 10 Q 20 60 35 110 Q 50 160 35 210"
                    stroke="url(#blueGlow1)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#strongGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  {/* Right Strand with enhanced glow */}
                  <motion.path
                    d="M 85 10 Q 100 60 85 110 Q 70 160 85 210"
                    stroke="url(#blueGlow2)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#strongGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  />

                  {/* Enhanced Connecting Bars (Base Pairs) with varied lengths */}
                  {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((y, i) => {
                    const progress = y / 220
                    const x1 = 35 + Math.sin(progress * Math.PI * 2) * 15
                    const x2 = 85 - Math.sin(progress * Math.PI * 2) * 15
                    return (
                      <g key={i}>
                        {/* Glowing bar */}
                        <motion.line
                          x1={x1}
                          y1={y}
                          x2={x2}
                          y2={y}
                          stroke="url(#barGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          filter="url(#strongGlow)"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: [0, 1, 1], scaleX: 1 }}
                          transition={{
                            duration: 1.5,
                            delay: 0.4 + i * 0.08,
                            opacity: { duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.3 },
                          }}
                        />
                        {/* Base pair nodes */}
                        <motion.circle
                          cx={x1}
                          cy={y}
                          r="4"
                          fill="#22d3ee"
                          filter="url(#strongGlow)"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                        />
                        <motion.circle
                          cx={x2}
                          cy={y}
                          r="4"
                          fill="#0ea5e9"
                          filter="url(#strongGlow)"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                        />
                      </g>
                    )
                  })}

                  {/* Enhanced Floating Molecular Structures with bonds */}
                  {[
                    { cx: 8, cy: 50, satellites: 3 },
                    { cx: 112, cy: 100, satellites: 2 },
                    { cx: 10, cy: 150, satellites: 3 },
                    { cx: 110, cy: 190, satellites: 2 },
                  ].map((mol, i) => (
                    <g key={`mol-${i}`}>
                      {/* Central molecule */}
                      <motion.circle
                        cx={mol.cx}
                        cy={mol.cy}
                        r="4"
                        fill="#22d3ee"
                        filter="url(#strongGlow)"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0.8, 1], scale: [0, 1, 1.1, 1] }}
                        transition={{
                          duration: 3,
                          delay: i * 0.4,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                      {/* Satellite molecules */}
                      {Array.from({ length: mol.satellites }).map((_, j) => {
                        const angle = (j / mol.satellites) * Math.PI * 2
                        const satX = mol.cx + Math.cos(angle) * 10
                        const satY = mol.cy + Math.sin(angle) * 10
                        return (
                          <g key={j}>
                            <motion.line
                              x1={mol.cx}
                              y1={mol.cy}
                              x2={satX}
                              y2={satY}
                              stroke="#0891b2"
                              strokeWidth="1.5"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.7, 0.5, 0.7] }}
                              transition={{
                                duration: 3,
                                delay: i * 0.4 + j * 0.15,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }}
                            />
                            <motion.circle
                              cx={satX}
                              cy={satY}
                              r="2.5"
                              fill="#06b6d4"
                              filter="url(#softGlow)"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: [0, 0.9, 0.7, 0.9], scale: [0, 1, 0.9, 1] }}
                              transition={{
                                duration: 3,
                                delay: i * 0.4 + j * 0.15,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }}
                            />
                          </g>
                        )
                      })}
                    </g>
                  ))}

                  {/* Enhanced Gradients and Filters */}
                  <defs>
                    <linearGradient id="blueGlow1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="blueGlow2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity="1" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>

                {/* Enhanced Scanning Beam Effect with stronger glow */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-56 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  style={{
                    boxShadow:
                      "0 0 30px rgba(34, 211, 238, 1), 0 0 60px rgba(34, 211, 238, 0.7), 0 0 90px rgba(34, 211, 238, 0.4)",
                  }}
                  initial={{ top: 0, opacity: 0 }}
                  animate={{
                    top: ["0%", "100%"],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    times: [0, 0.1, 0.9, 1],
                  }}
                />

                {/* Enhanced Background Glow with pulsing effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 via-blue-500/20 to-cyan-500/30 blur-3xl -z-10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              </div>

              <motion.p
                className="text-2xl font-semibold bg-gradient-to-r from-cyan-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent mb-3"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                Decoding Your Cosmic DNA
              </motion.p>
              <p className="text-cyan-400/60 text-sm font-mono">Analyzing planetary combinations...</p>
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
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
                  <h3 className="text-violet-400/80 font-medium text-sm tracking-widest uppercase">Career Pathways</h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-violet-500/30 to-transparent"></div>
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
              className="text-center text-violet-400/40 mt-32 font-light italic"
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

      <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -30px) scale(1.1); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-30px, 30px) scale(1.1); }
                }
                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 25s ease-in-out infinite;
                }
            `}</style>
    </div>
  )
}

export default CareerDashboard
