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
import { Sparkles, Loader2, LogIn, LogOut } from "lucide-react"
import { CosmicOrb } from "@/components/ui/CosmicOrb"
import { getBirthChart } from "@/services/api/birthChart"
import { useAppStore } from "@/lib/store"
import { ServicesGrid } from "@/components/services"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import "@/lib/i18n"

import { useNotificationOrchestrator } from "@/hooks/useNotificationOrchestrator"
import { LanguageToggle } from "@/components/ui/LanguageToggle"
import "@/lib/i18n"

type Phase = "landing" | "name" | "date" | "time" | "location" | "login" | "awakening" | "dashboard"

export default function Home() {
  const { t } = useTranslation()
  const { user, signInWithGoogle, loading, logout } = useAuth()
  // Global Notification Permission Hook
  const { showPermissionBanner, requestWebPermissions, dismissPermissionBanner } = useNotificationOrchestrator();

  const { setCurrentProfile, setChartData } = useAppStore()
  const [phase, setPhase] = useState<Phase>("landing")
  const [dashboardView, setDashboardView] = useState<'services' | 'chat'>('services')
  const router = useRouter()
  const [onboardData, setOnboardData] = useState({
    name: "",
    gender: "",
    date: "",
    time: "",
    lat: null as number | null,
    lon: null as number | null,
    city: ""
  })

  // Watch for Auth changes to set initial phase if needed
  // Note: We want to stay on landing if user is logged in, to show Main Home Page.

  const handleNext = (data: any) => {
    setOnboardData(prev => ({ ...prev, ...data }))
    
    switch (phase) {
        case "landing": setPhase("name"); break;
        case "name": setPhase("date"); break;
        case "date": setPhase("time"); break;
        case "time": setPhase("location"); break;
        case "location": setPhase("login"); break;
        default: break;
    }
  }

  const handleLogin = async () => {
    try {
        if (!user) {
            await signInWithGoogle()
        }
        // Redirect to Landing Page (Main Home with Orb/Services)
        setPhase("awakening")
        setTimeout(() => setPhase("landing"), 2500)
    } catch (error) {
        console.error("Login cancelled or failed", error)
    }
  }
  
  const handleDirectLogin = async () => {
    try {
        await signInWithGoogle()
        // Stay on Landing Page
        setPhase("landing") 
    } catch (error) {
        console.error("Direct login failed", error)
    }
  } 

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0612]">
        <Loader2 className="w-10 h-10 text-[var(--color-lavender)] animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen text-[var(--color-light)] overflow-hidden relative selection:bg-[var(--color-lavender)] selection:text-white font-sans">
      {/* Global Language Toggle (Visible in Landing/Onboarding) */}
      {phase !== "dashboard" && (
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>
      )}

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
            
            {/* LOGOUT BUTTON - Visible only when logged in on Landing Page */}
            {user && (
                <div className="absolute top-4 left-4 z-50">
                    <button 
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs uppercase tracking-wider font-medium backdrop-blur-md"
                    >
                        <LogOut size={14} />
                        <span>{t('common.logout', 'Sign Out')}</span>
                    </button>
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center space-y-16 w-full max-w-7xl mx-auto px-4">
              {/* Logo */}
              <motion.div
                className="relative"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <CosmicOrb />
              </motion.div>

              {/* Title */}
              <div className="text-center space-y-4">
                <motion.h1
                  className="text-6xl md:text-7xl font-light text-[var(--color-light)] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="bg-gradient-to-r from-[var(--color-light)] to-[var(--color-lavender)] bg-clip-text text-transparent">
                      {t('welcome')}
                  </span>
                </motion.h1>
              </div>

              {/* CTA Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col items-center gap-8 w-full">
                {user ? (
                  <div className="flex flex-col items-center gap-8 w-full">
                  
                  <div className="w-full max-w-5xl">
                    <ServicesGrid 
                      title={t('celestial_services')}
                      onServiceClick={(service) => {
                        if (service.id === 'ask-question') {
                             setDashboardView('chat')
                             setPhase("dashboard")
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
                        {t('begin_journey')}
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
                      <span className="text-sm font-medium">{t('already_have_account')}</span>
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
              {t('reading_stars')}
            </motion.p>
          </motion.div>
        )}

        {/* Dashboard */}
        {phase === "dashboard" && <DashboardLayout defaultView={dashboardView} />}
      </AnimatePresence>
      {/* Global Permission Banner (PWA) */}
      {showPermissionBanner && (
          <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-[#0A0A0A] border-t border-white/10 shadow-2xl animate-slide-up">
              <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1">🔔 {t('panchang_page.enable_nots', 'Enable Daily Alerts?')}</h4>
                      <p className="text-xs text-white/60">{t('panchang_page.enable_nots_desc', 'Get notified for Shubh Muhurat & Rahu Kaal.')}</p>
                  </div>
                  <div className="flex gap-2">
                       <button 
                          onClick={dismissPermissionBanner}
                          className="text-xs text-white/40 px-3 py-2 hover:text-white transition-colors"
                       >
                          {t('common.later', 'Later')}
                       </button>
                       <button 
                          onClick={requestWebPermissions}
                          className="text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all active:scale-95"
                       >
                          {t('common.allow', 'Allow')}
                       </button>
                  </div>
              </div>
          </div>
      )}
    </main>
  )
}
