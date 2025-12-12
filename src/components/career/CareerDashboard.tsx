
"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchCareerPrediction, generateCacheKey, setPrediction, clearCareerData } from "@/redux/slices/careerSlice"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronDown, RefreshCw, Zap, AlertCircle, ArrowLeft, User } from "lucide-react"
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
    const totalHeight = helixLength * verticalSpacing

    const render = () => {
      time += speed
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Calculate Scanning Ring Position (Ping Pong between top and bottom)
      const scanY = yOffset + (Math.sin(time) + 1) * 0.5 * totalHeight

      // Render DNA
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

      // Draw DNA
      particles.forEach(p => {
        if (p.type === 'connector') {
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
            ctx.beginPath()
            ctx.arc(p.x!, p.y!, 6 * p.scale!, 0, Math.PI * 2)
            ctx.fillStyle = p.color!
            ctx.globalAlpha = p.alpha!
            ctx.fill()
            ctx.shadowBlur = 15 * p.scale!
            ctx.shadowColor = p.color!
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.globalAlpha = 1
        }
      })

      // Draw Scanning Ring
      ctx.save()
      ctx.beginPath()
      // Draw an ellipse for the ring
      ctx.ellipse(xOffset, scanY, radius + 20, 10, 0, 0, Math.PI * 2)
      ctx.strokeStyle = '#facc15' // Yellow ring
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = '#facc15'
      ctx.stroke()

      // Draw Rays (Scanning Light)
      // Gradient fading out downwards
      const rayGradient = ctx.createLinearGradient(xOffset, scanY, xOffset, scanY + 40)
      rayGradient.addColorStop(0, 'rgba(250, 204, 21, 0.4)')
      rayGradient.addColorStop(1, 'rgba(250, 204, 21, 0)')
      
      ctx.beginPath()
      ctx.ellipse(xOffset, scanY, radius + 20, 10, 0, 0, Math.PI * 2) 
      ctx.moveTo(xOffset - (radius + 20), scanY)
      ctx.lineTo(xOffset - (radius + 10), scanY + 40) // Taper inwards
      ctx.lineTo(xOffset + (radius + 10), scanY + 40)
      ctx.lineTo(xOffset + (radius + 20), scanY)
      ctx.fillStyle = rayGradient
      ctx.fill()
      
      ctx.restore()

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

  // Save to localStorage REMOVED as per request

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

    // ALWAYS Fetch fresh data (Bypass Cache)
    dispatch(
      fetchCareerPrediction({
        date: profile.date,
        time: profile.time,
        lat: profile.location.lat,
        lon: profile.location.lon,
        timezone: profile.location.timezone,
        name: profile.name,
        language: i18n.language || "hi",
        profileId: profile.id,
        forceRefresh: true // Bypass Redux/Local cache
      }),
    )
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  const isDisplayingLoader = showLoader || loading

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-light)] p-6 md:p-12 relative overflow-hidden">
      <FloatingStars />

      {/* Header & Input Section - Hide when loading */}
      {!isDisplayingLoader && (
        <>
          <header className="max-w-7xl mx-auto mb-12 text-center relative z-10 pt-20">
            <div className="absolute top-0 left-0">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-lavender)]/10 hover:bg-[var(--color-lavender)]/20 border border-[var(--color-lavender)]/20 rounded-xl text-[var(--color-lavender)] hover:text-[var(--color-light)] transition-all text-sm font-medium group backdrop-blur-sm"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  {t('Back to Home')}
                </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-lavender)]/10 backdrop-blur-sm border border-[var(--color-lavender)]/20 text-[var(--color-lavender)] text-xs font-medium tracking-widest uppercase mb-6"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>{t('Cosmic Career Intelligence')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl md:text-7xl font-serif font-bold bg-gradient-to-r from-[var(--color-lavender)] via-[var(--color-violet)] to-[var(--color-lavender)] bg-clip-text text-transparent mb-4 leading-tight italic"
            >
              {t('Unveil Your Cosmic Path')}
            </motion.h1>
          </header>

          <div className="max-w-2xl mx-auto mb-16 relative z-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">


              <div className="relative flex flex-col sm:flex-row items-center gap-4">
                {/* Custom Glassmorphism Dropdown */}
                <div className="relative flex-1 w-full">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 hover:border-violet-500/30 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <User size={16} className="text-violet-400" />
                      {selectedProfile ? selectedProfile.name : t('dasha.choose_profile', 'Choose saved profile...')}
                    </span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                      >
                        {profiles.length > 0 ? (
                          profiles.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedProfileId(p.id)
                                    setIsDropdownOpen(false)
                                }}
                                className="w-full text-left p-3 hover:bg-violet-500/10 text-slate-300 text-sm border-b border-slate-800 last:border-0"
                            >
                                {p.name}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-slate-500 text-sm italic">
                            {t('No profiles found')}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!selectedProfileId || loading || isDisplayingLoader || !!currentPrediction}
                  className="btn-celestial px-4 py-3 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group whitespace-nowrap shadow-lg hover:shadow-cyan-500/20"
                >
                  <Zap size={16} className="group-hover:scale-110 transition-transform" fill="currentColor" />
                  <span>{t('Reveal')}</span>
                </button>
              </div>
              <div className="text-center mt-2 text-xs text-[var(--color-light)]/20 font-mono">
                Language: {i18n.language || "undefined"}
              </div>
            </motion.div>
          </div>
        </>
      )}

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
