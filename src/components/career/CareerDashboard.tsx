
"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchCareerPrediction, generateCacheKey, setPrediction, clearCareerData } from "@/redux/slices/careerSlice"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronDown, RefreshCw, Zap, AlertCircle, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const helixLength = 24
    const radius = 50
    const verticalSpacing = 16
    const xOffset = canvas.width / 2
    const yOffset = 40
    const speed = 0.03

    const render = () => {
      time += speed
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // We need to sort particles by Z-index to render back-to-front for proper occlusion
      const particles = []

      for (let i = 0; i < helixLength; i++) {
        const angle = (i * 0.5) + time
        const y = i * verticalSpacing + yOffset
        
        // Strand 1
        const x1 = Math.cos(angle) * radius + xOffset
        const z1 = Math.sin(angle) * radius
        const scale1 = (z1 + 200) / 200 // Simple perspective scale
        const alpha1 = (z1 + radius) / (2 * radius) * 0.8 + 0.2 // Depth based opacity

        // Strand 2 (180 degrees offset)
        const x2 = Math.cos(angle + Math.PI) * radius + xOffset
        const z2 = Math.sin(angle + Math.PI) * radius
        const scale2 = (z2 + 200) / 200
        const alpha2 = (z2 + radius) / (2 * radius) * 0.8 + 0.2

        particles.push({ x: x1, y, z: z1, scale: scale1, alpha: alpha1, color: '#22d3ee', type: 'node' })
        particles.push({ x: x2, y, z: z2, scale: scale2, alpha: alpha2, color: '#3b82f6', type: 'node' })
        
        // Connector (Base Pair)
        particles.push({ 
            x1, y1: y, z1, 
            x2, y2: y, z2, 
            z: (z1 + z2) / 2, // Average Z for sorting
            type: 'connector',
            alpha: Math.min(alpha1, alpha2)
        })
      }

      // Sort by Z (depth)
      particles.sort((a, b) => a.z - b.z)

      // Draw
      particles.forEach(p => {
        if (p.type === 'connector') {
            // Gradient for connector
            const gradient = ctx.createLinearGradient(p.x1!, p.y1!, p.x2!, p.y2!)
            gradient.addColorStop(0, `rgba(34, 211, 238, ${p.alpha})`)
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${p.alpha})`)
            gradient.addColorStop(1, `rgba(34, 211, 238, ${p.alpha})`)
            
            ctx.beginPath()
            ctx.moveTo(p.x1!, p.y1!)
            ctx.lineTo(p.x2!, p.y2!)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 3
            ctx.stroke()
        } else {
            // Node
            ctx.beginPath()
            ctx.arc(p.x!, p.y!, 6 * p.scale!, 0, Math.PI * 2)
            ctx.fillStyle = p.color!
            ctx.globalAlpha = p.alpha!
            ctx.fill()
            
            // Glow
            ctx.shadowBlur = 15 * p.scale!
            ctx.shadowColor = p.color!
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.globalAlpha = 1
        }
      })

      // Draw Backbone (Curves) - simplified as connecting lines for now or quadratic curves
      // To draw smooth curves behind/in-front properly is hard with Z-sorting particles.
      // A simple approach is to draw lines between consecutive nodes of the same strand.
      // But we need to split them by Z segments? 
      // Actually, for a simple loader, the particles + connectors look great. 
      // Let's add simple connecting lines between nodes *before* drawing nodes, but that messes up Z-sort.
      // Given the "High Contrast" request, the nodes and bars are the most important.
      // Let's try to draw segments between i and i+1.
      
      // Re-loop to draw segments? No, let's stick to the particle system for clarity and performance.
      // The "High Contrast" look relies heavily on the glowing nodes and bars.
      
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] relative"
    >
      <div className="relative w-[300px] h-[450px]">
        <canvas 
            ref={canvasRef} 
            width={300} 
            height={450} 
            className="w-full h-full"
        />
      </div>

      {/* Loading Text - High Contrast */}
      <motion.div
        className="mt-4 text-center z-10"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <p className="text-cyan-300 font-bold text-2xl tracking-widest uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          Decoding Career DNA
        </p>
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-4"
          animate={{ width: ["0%", "50%", "0%"] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.div>
    </motion.div>
  )
}

const CareerDashboard = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
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

  // Clear data on profile change
  useEffect(() => {
    if (selectedProfileId) {
      dispatch(clearCareerData())
    }
  }, [selectedProfileId, dispatch])

  // Save to localStorage when prediction updates
  useEffect(() => {
    if (currentPrediction && selectedProfileId) {
      const profile = profiles.find(p => p.id === selectedProfileId)
      if (profile) {
        const cacheKey = generateCacheKey(profile.date, profile.time, profile.location.lat, profile.location.lon)
        localStorage.setItem(`career_prediction_${cacheKey}`, JSON.stringify(currentPrediction))
      }
    }
  }, [currentPrediction, selectedProfileId, profiles])

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

    const cacheKey = generateCacheKey(profile.date, profile.time, profile.location.lat, profile.location.lon)
    const cachedData = localStorage.getItem(`career_prediction_${cacheKey}`)

    if (cachedData) {
      // Fake loading for "acting"
      setShowLoader(true)
      loadingStartTime.current = Date.now()
      
      setTimeout(() => {
        try {
          const parsedData = JSON.parse(cachedData)
          dispatch(setPrediction(parsedData))
        } catch (e) {
          console.error("Error parsing cached data", e)
          // Fallback to API if cache is corrupt
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
        } finally {
          setShowLoader(false)
        }
      }, 3000) // 3 seconds fake delay
    } else {
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
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  const isDisplayingLoader = showLoader || loading

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-light)] p-6 md:p-12 relative overflow-hidden">
      <FloatingStars />

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center relative z-10 pt-20">
        <div className="absolute top-0 left-0">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-lavender)]/10 hover:bg-[var(--color-lavender)]/20 border border-[var(--color-lavender)]/20 rounded-xl text-[var(--color-lavender)] hover:text-[var(--color-light)] transition-all text-sm font-medium group backdrop-blur-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
        </div>

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
              disabled={!selectedProfileId || loading || isDisplayingLoader || !!currentPrediction}
              className="btn-celestial px-8 py-4 rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              {isDisplayingLoader ? (
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
