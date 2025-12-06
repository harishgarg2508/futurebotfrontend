"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Sun, Moon, Star, Activity, Sparkles } from "lucide-react"

interface PlanetarySidebarProps {
  chartData: any
}

const PlanetarySidebar: React.FC<PlanetarySidebarProps> = ({ chartData }) => {
  if (!chartData) return null

  const getPlanetSign = (planetName: string) => {
    return chartData.planets?.[planetName]?.sign || "Unknown"
  }

  const ascendant = chartData.ascendant?.sign || "Cancer"
  const sunSign = getPlanetSign("Sun") || "Scorpio"
  const moonSign = getPlanetSign("Moon") || "Pisces"

  const cosmicItems = [
    {
      icon: Activity,
      label: "Ascendant (Lagna)",
      value: ascendant,
      gradient: "from-violet-500/20 to-fuchsia-500/20",
      iconColor: "text-violet-400",
      glowColor: "rgba(139, 92, 246, 0.3)",
    },
    {
      icon: Sun,
      label: "Sun Sign (Surya)",
      value: sunSign,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      glowColor: "rgba(251, 191, 36, 0.3)",
    },
    {
      icon: Moon,
      label: "Moon Sign (Chandra)",
      value: moonSign,
      gradient: "from-slate-400/20 to-blue-400/20",
      iconColor: "text-slate-300",
      glowColor: "rgba(148, 163, 184, 0.3)",
    },
  ]

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="hidden md:flex flex-col w-80 h-full p-6 space-y-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0f0a1f] via-[#130d24] to-[#0f0a1f]"
    >
      {/* Header */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
          </motion.div>
          <span className="text-violet-400/80 text-xs uppercase tracking-[0.2em] font-medium">Cosmic Identity</span>
        </motion.div>
        <h1 className="text-3xl text-violet-100 font-light tracking-wide">Natal Chart</h1>
      </div>

      {/* Cosmic Items */}
      <div className="space-y-4">
        {cosmicItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="group cursor-default"
          >
            <div
              className={`
              flex items-center gap-4 p-4 rounded-2xl 
              bg-gradient-to-r ${item.gradient}
              border border-violet-500/10 
              backdrop-blur-sm
              transition-all duration-300
              hover:border-violet-400/30
              hover:shadow-lg
            `}
              style={{
                boxShadow: `0 0 0 rgba(139, 92, 246, 0)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 25px ${item.glowColor}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 rgba(139, 92, 246, 0)`
              }}
            >
              <motion.div whileHover={{ rotate: 15 }} className={`p-3 rounded-xl bg-[#0f0a1f]/60 ${item.iconColor}`}>
                <item.icon className="w-5 h-5" />
              </motion.div>
              <div className="flex-1">
                <p className="text-[10px] text-violet-400/60 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-lg text-violet-100 font-light group-hover:text-white transition-colors">
                  {item.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Element */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="relative w-32 h-32 opacity-20"
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 border border-violet-400/30 rounded-full"
              style={{
                transform: `rotate(${i * 30}deg) scale(${1 - i * 0.2})`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Star className="w-8 h-8 text-violet-400" />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-6 border-t border-violet-500/10"
      >
        <p className="text-center text-[10px] text-violet-400/40 tracking-widest uppercase">VedicAI System v2.0</p>
        <p className="text-center text-[10px] text-violet-500/30 mt-1">Aligning with the Cosmos</p>
      </motion.div>
    </motion.div>
  )
}

export default PlanetarySidebar
