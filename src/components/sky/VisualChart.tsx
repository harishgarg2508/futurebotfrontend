"use client"

import React from "react"
import { useAppStore } from "@/lib/store"
import { useTranslation } from "react-i18next"
import { NorthIndianChart } from "@/components/services/varshphal/NorthIndianChart"
import { PlanetarySummary } from "./PlanetarySummary"
import { motion } from "framer-motion"
import { Sparkles, RotateCcw, Star } from "lucide-react"

import { ServicesButton } from "@/components/services"
import { useRouter } from "next/navigation"

export const VisualChart: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { currentChartData, currentProfile, setChartData } = useAppStore()
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleRetry = async () => {
    if (!currentProfile) return
    setLoading(true)
    setError(null)
    try {
      const { getBirthChart } = await import("@/services/api/birthChart")
      const data = await getBirthChart({
        date: currentProfile.date,
        time: currentProfile.time,
        lat: currentProfile.location.lat,
        lon: currentProfile.location.lon,
      })
      setChartData(data)
    } catch (err) {
      console.error(err)
      setError("Failed to consult the stars. The API might be down.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (currentProfile && !currentChartData && !loading && !error) {
      handleRetry()
    }
  }, [currentProfile, currentChartData])

  if (!currentProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-rose-500/20 rounded-full blur-2xl" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/10 to-rose-500/10 border border-violet-400/20 flex items-center justify-center">
            <Star className="w-8 h-8 text-violet-300/60" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-slate-400 text-sm max-w-xs"
        >
          Select a chart from the library to view the celestial positions
        </motion.p>
      </div>
    )
  }

  if (loading || !currentChartData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-400/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-rose-300" />
              </div>
              <p className="text-rose-300 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-rose-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Calculation
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-6">
              {/* Loading animation */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-violet-400/20 border-t-violet-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-violet-300 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <p className="text-slate-300 text-sm font-medium">Calculating celestial positions...</p>
                <p className="text-slate-500 text-xs max-w-xs">Aligning the stars for your birth chart</p>
              </div>
              <button
                onClick={handleRetry}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
              >
                Taking too long? Click to retry
              </button>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between border-b border-violet-400/10 pb-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-rose-400" />
              <span className="text-[10px] uppercase tracking-widest text-violet-300/60 font-medium">{t('chart.birth_chart', 'Birth Chart')}</span>
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-200 via-rose-200 to-amber-200 bg-clip-text text-transparent">
              {currentProfile.name}
            </h2>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t('chart.ascendant', 'Ascendant')}</div>
              <div className="text-lg font-semibold text-amber-200/90">{t(`signs.${currentChartData.ascendant?.sign}`, currentChartData.ascendant?.sign)}</div>
            </div>
            <ServicesButton 
              onServiceClick={(service: any) => {
                if (service.href) router.push(service.href)
              }}
            />
          </div>
        </motion.div>

        {/* Content Grid */}
        {/* Content Grid */}
        <div className="flex flex-col gap-8">
          {/* Chart - Takes full width */}
          <div className="w-full space-y-6">
            <div className="max-w-xl mx-auto lg:max-w-none">
              <NorthIndianChart
                planets={currentChartData.planets}
                ascendantSignId={currentChartData.ascendant.sign_id || 1}
              />
            </div>
          </div>

          {/* Planetary Summary - Takes full width below chart */}
          <div className="w-full">
               <PlanetarySummary />
          </div>
        </div>
      </div>
    </div>
  )
}
