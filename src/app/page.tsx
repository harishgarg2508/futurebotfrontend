"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import StepName from "@/components/onboarding/StepName"
import StepDate from "@/components/onboarding/StepDate"
import StepTime from "@/components/onboarding/StepTime"
import StepLocation from "@/components/onboarding/StepLocation"
import StepLogin from "@/components/onboarding/StepLogin"
import FloatingStars from "@/components/onboarding/FloatingStars"
import { Sparkles, Loader2, LogIn } from "lucide-react"
import { getBirthChart } from "@/services/api/birthChart"
import { useAppStore } from "@/lib/store"
import { ServicesGrid } from "@/components/services"
import { useRouter } from "next/navigation"

type Phase = "landing" | "name" | "date" | "time" | "location" | "login" | "awakening" | "dashboard"

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth()
  const { setCurrentProfile, setChartData } = useAppStore()
  const [phase, setPhase] = useState<Phase>("landing")

  const [onboardData, setOnboardData] = useState<{
    name: string
    gender: "male" | "female"
    date: string
    time: string
    lat: number
    lon: number
    city: string
  }>({
    name: "",
    gender: "male", // Default
    date: "",
    time: "",
    lat: 0,
    lon: 0,
    city: "",
  })

  const handleNext = (data: Partial<typeof onboardData>) => {
    setOnboardData((prev) => ({ ...prev, ...data }))
    if (phase === "name") setPhase("date")
    else if (phase === "date") setPhase("time")
    else if (phase === "time") setPhase("location")
    else if (phase === "location") setPhase("login")
  }

  const fetchInitialChart = async (finalData: typeof onboardData) => {
    try {
      const chart = await getBirthChart({
        date: finalData.date,
        time: finalData.time,
        lat: finalData.lat,
        lon: finalData.lon,
      })

      const newProfile = {
        id: crypto.randomUUID(),
        name: finalData.name,
        gender: finalData.gender || "male",
        date: finalData.date,
        time: finalData.time,
        location: {
          lat: finalData.lat,
          lon: finalData.lon,
          city: finalData.city,
        },
      }

      setCurrentProfile(newProfile)
      setChartData(chart)
      setPhase("dashboard")

      const { addProfileToFirebase } = await import("@/services/firebaseService")
      if (user) addProfileToFirebase(user.uid, newProfile)
    } catch (e: any) {
      console.error("Fetch Chart Failed:", e)
      alert(`Failed to fetch chart: ${e.message || "Unknown Error"}. Please checking backend is running.`)
      setPhase("dashboard")
    }
  }

  useEffect(() => {
    if (user && phase === "awakening" && onboardData.name) {
      // User just logged in from onboarding
      fetchInitialChart(onboardData)
    }
  }, [user, phase, onboardData])

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
      setPhase("awakening")
      // fetchInitialChart is now triggered by the useEffect when user becomes available
    } catch (err) {
      console.error("Login failed", err)
    }
  }

  // Direct login for existing users - goes straight to dashboard
  const handleDirectLogin = async () => {
    try {
      await signInWithGoogle()
      setPhase("dashboard")
    } catch (err) {
      console.error("Login failed", err)
    }
  }
  
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0612]">
        <Loader2 className="w-10 h-10 text-[var(--color-lavender)] animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen text-[var(--color-light)] overflow-hidden relative selection:bg-[var(--color-lavender)] selection:text-white font-sans">
      <AnimatePresence mode="wait">
        {/* Landing */}
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen relative"
          >
            <FloatingStars />

            <div className="relative z-10 flex flex-col items-center space-y-16 w-full max-w-7xl mx-auto px-4">
              {/* Logo */}
              <motion.div
                className="relative"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-lavender)] to-[var(--color-violet)] blur-3xl opacity-40 scale-150 rounded-full" />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[var(--color-lavender)] via-[var(--color-violet)] to-[var(--color-rose)] flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-14 h-14 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <div className="text-center space-y-4">
                <motion.h1
                  className="text-6xl md:text-7xl font-light text-[var(--color-light)] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Vedic
                  <span className="bg-gradient-to-r from-[var(--color-lavender)] to-[var(--color-rose)] bg-clip-text text-transparent">
                    AI
                  </span>
                </motion.h1>
                <motion.p
                  className="text-[var(--color-muted)] text-lg tracking-widest uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Celestial Wisdom
                </motion.p>
              </div>

              {/* CTA Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col items-center gap-8 w-full">
                {user ? (
                  <div className="flex flex-col items-center gap-8 w-full">
                   <motion.button
                    onClick={() => setPhase("dashboard")}
                    className="px-12 py-5 rounded-full btn-celestial text-lg font-medium tracking-wide"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enter Dashboard
                  </motion.button>
                  
                  <div className="w-full max-w-5xl">
                    <ServicesGrid 
                      title="Celestial Services" 
                      onServiceClick={(service) => {
                        // Open component or navigate
                        if (service.component) {
                             // Handle component logic if needed, for now console log or alert
                             console.log("Component clicked:", service.component)
                        }
                        else if (service.href) router.push(service.href)
                      }} 
                    />
                  </div>
                  </div>
                ) : (
                  <>
                    <motion.button
                      onClick={() => setPhase("name")}
                      className="group relative px-12 py-5 rounded-full overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-lavender)] to-[var(--color-violet)] opacity-100 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-lavender)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10 text-white text-lg font-medium tracking-wide">
                        Begin Your Journey
                      </span>
                    </motion.button>
                    
                    {/* Login button for existing users */}
                    <motion.button
                      onClick={handleDirectLogin}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm font-medium">Already have an account? Sign in</span>
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Onboarding Steps */}
        {phase === "name" && <StepName key="name" onNext={(name, gender) => handleNext({ name, gender })} onDirectLogin={() => setPhase("dashboard")} />}

        {phase === "date" && (
          <StepDate
            key="date"
            name={onboardData.name}
            onNext={(date) => handleNext({ date })}
            onBack={() => setPhase("name")}
          />
        )}

        {phase === "time" && (
          <StepTime key="time" onNext={(time) => handleNext({ time })} onBack={() => setPhase("date")} />
        )}

        {phase === "location" && (
          <StepLocation
            key="location"
            onNext={(loc) => handleNext({ lat: loc.lat, lon: loc.lon, city: loc.name })}
            onBack={() => setPhase("time")}
          />
        )}

        {/* Login Step */}
        {phase === "login" && <StepLogin key="login" onLogin={handleLogin} onBack={() => setPhase("location")} />}

        {/* Loading / Awakening */}
        {phase === "awakening" && (
          <motion.div
            key="awakening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen space-y-8"
          >
            <FloatingStars />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader2 className="w-16 h-16 text-[var(--color-lavender)]" />
            </motion.div>
            <motion.p
              className="text-2xl text-[var(--color-muted)] font-light"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Reading the stars...
            </motion.p>
          </motion.div>
        )}

        {/* Dashboard */}
        {phase === "dashboard" && <DashboardLayout />}
      </AnimatePresence>
    </main>
  )
}
