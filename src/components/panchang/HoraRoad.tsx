import { useState, useRef, useEffect } from "react"
import type { HoraSlot } from "@/types/panchang"
import { motion, AnimatePresence } from "framer-motion"

interface HoraRoadProps {
  data: HoraSlot[]
  currentTime?: string
  onItemClick?: (planet: string) => void
}

import { useTranslation } from "react-i18next";

const HoraRoad: React.FC<HoraRoadProps> = ({ data, currentTime, onItemClick }) => {
  const { t } = useTranslation();
  const [showRoad, setShowRoad] = useState(false)
  const [progress, setProgress] = useState(0)
  const activeSlotRef = useRef<HTMLDivElement>(null)

  // Find current Hora
  const currentHora = data.find(slot => {
    if (!currentTime) return false
    if (slot.start_time > slot.end_time) {
      return currentTime >= slot.start_time || currentTime < slot.end_time
    }
    return currentTime >= slot.start_time && currentTime < slot.end_time
  })

  // Calculate progress percentage
  useEffect(() => {
    if (!currentHora || !currentTime) return

    const calculateProgress = () => {
      const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number)
        return h * 60 + m
      }

      const currentMinutes = timeToMinutes(currentTime)
      let startMinutes = timeToMinutes(currentHora.start_time)
      let endMinutes = timeToMinutes(currentHora.end_time)

      // Handle midnight crossing
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60
        if (currentMinutes < startMinutes) {
          return ((currentMinutes + 24 * 60 - startMinutes) / (endMinutes - startMinutes)) * 100
        }
      }

      const elapsed = currentMinutes - startMinutes
      const total = endMinutes - startMinutes
      return Math.min(Math.max((elapsed / total) * 100, 0), 100)
    }

    setProgress(calculateProgress())
  }, [currentHora, currentTime])

  // Auto-scroll to active slot when modal opens
  useEffect(() => {
    if (showRoad && activeSlotRef.current) {
      setTimeout(() => {
        activeSlotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 300)
    }
  }, [showRoad])

  const planetEmoji: Record<string, string> = {
    Sun: "☀️",
    Moon: "🌙",
    Mars: "🔴",
    Mercury: "☿️",
    Jupiter: "🪐",
    Venus: "♀️",
    Saturn: "🪐"
  }

  const activeIndex = data.findIndex(slot => 
    currentHora && slot.slot === currentHora.slot
  )

  return (
    <div className="px-4 pb-4">
      {/* 1. The Dock (Always Visible) - Triggers Roadmap */}
      <motion.div
        onClick={() => setShowRoad(true)}
        className="relative h-16 md:h-18 cosmic-glass rounded-full flex items-center px-2 cursor-pointer overflow-hidden animate-border-glow"
        whileTap={{ scale: 0.98 }}
      >
        {currentHora ? (
          <>
            {/* Progress Bar Background */}
            <div 
              className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${getHoraGlow(currentHora.color)}`}
              style={{ width: `${progress}%` }}
            />

            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cosmic-glass ${getHoraBorder(currentHora.color)} z-10`}>
              <span className="text-xl filter drop-shadow-lg">
                {planetEmoji[currentHora.planet] || "⭐"}
              </span>
            </div>

            {/* Text */}
            <div className="ml-4 flex-1 z-10">
              <div className="text-white font-bold tracking-wide">{t('planets.' + currentHora.planet, { defaultValue: currentHora.planet })}</div>
              <div className="text-xs text-yellow-300/60">{t('panchang_grid.ends', 'Ends')} {currentHora.end_time} • {t('panchang_page.tap_roadmap', 'Tap for roadmap')}</div>
            </div>

            <div className="mr-4 text-yellow-400/60 animate-cosmic-pulse z-10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </>
        ) : (
          <div className="p-4 text-yellow-300/50 text-sm">{t('panchang_page.loading_hora', 'Loading Hora...')}</div>
        )}
      </motion.div>

      {/* 2. The Full Road (Overlay Modal) */}
      <AnimatePresence>
        {showRoad && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-end md:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRoad(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-[85vh] cosmic-glass-intense rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex flex-col border-b border-yellow-500/10 bg-gradient-to-b from-yellow-900/20 to-transparent sticky top-0 z-20 backdrop-blur-md">
                <div className="p-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white tracking-wide">Hora Timeline</h3>
                  <button onClick={() => setShowRoad(false)} className="w-8 h-8 rounded-full cosmic-glass flex items-center justify-center text-yellow-300/60 hover:text-white">✕</button>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-0 relative cosmic-scrollbar">
                {/* Timeline Line */}
                <div className="absolute left-[43px] top-6 bottom-6 w-[2px] bg-yellow-800/20 z-0" />
                
                {data.map((slot, idx) => {
                  const isPast = activeIndex !== -1 && idx < activeIndex
                  const isCurrent = currentHora?.slot === slot.slot
                  
                  return (
                    <div 
                      key={idx} 
                      className="relative pl-14 pb-8 last:pb-0 group"
                      ref={isCurrent ? activeSlotRef : null}
                      onClick={() => onItemClick?.(slot.planet)}
                    >
                      {/* Connecting Line */}
                      {idx < data.length - 1 && (
                        <div className={`absolute left-[43px] top-4 h-[calc(100%+32px)] w-[2px] z-0
                          ${isPast ? 'bg-gradient-to-b from-yellow-500/50 to-yellow-500/50' : 
                            isCurrent ? 'bg-gradient-to-b from-yellow-500/50 to-transparent' : 'bg-transparent'}
                        `} />
                      )}

                      {/* The Dot */}
                      <div
                        className={`absolute left-[36px] top-[14px] w-4 h-4 rounded-full border-[3px] z-10 transition-all duration-500
                          ${isCurrent 
                            ? `border-white scale-125 shadow-[0_0_15px_currentColor] ${getHoraDot(slot.color)}` 
                            : isPast 
                              ? "border-yellow-500/30 bg-yellow-900/80" 
                              : "border-yellow-800/30 bg-[#0a0a1a]"
                          }
                        `}
                      >
                        {isCurrent && (
                          <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getHoraDot(slot.color)}`} />
                        )}
                      </div>

                      {/* Card */}
                      <div className={`relative p-3 rounded-xl border transition-all duration-300 cursor-pointer
                        ${isCurrent 
                          ? "bg-yellow-500/10 border-yellow-500/40 shadow-lg translate-x-1" 
                          : isPast
                            ? "bg-yellow-900/5 border-yellow-800/10 opacity-60 grayscale-[0.5]"
                            : "bg-transparent border-transparent opacity-40 hover:opacity-80 border-dashed hover:border-solid hover:border-white/10"
                        }
                      `}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{planetEmoji[slot.planet] || "⭐"}</span>
                              <span className={`font-bold ${getHoraText(slot.color)} ${isCurrent ? 'text-white' : ''}`}>
                                {t('planets.' + slot.planet, slot.planet)}
                              </span>
                              {slot.is_night && (
                                <span className="text-[9px] uppercase tracking-wider bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                  {t('panchang_page.night', 'Night')}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-yellow-300/50 leading-snug max-w-[200px]">{t('planets.' + slot.planet, slot.planet)}</div>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 gap-2">
                            <div className={`text-xs font-mono px-2 py-1 rounded bg-black/20 border border-white/5 ${isCurrent ? "text-amber-400" : "text-yellow-400/50"}`}>
                              {slot.start_time}
                            </div>
                            <button className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white/40 hover:bg-white/10 hover:text-white">
                              ?
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getHoraGlow(color?: string) {
  if (color === 'gold') return "bg-yellow-500/30 opacity-50 blur-sm"
  if (color === 'green') return "bg-emerald-500/30 opacity-50 blur-sm"
  if (color === 'red') return "bg-red-500/30 opacity-50 blur-sm"
  if (color === 'purple') return "bg-purple-500/30 opacity-50 blur-sm"
  return "bg-slate-500/30 opacity-50 blur-sm"
}

function getHoraBorder(color?: string) {
  if (color === 'gold') return "border-yellow-500/30"
  if (color === 'green') return "border-emerald-500/30"
  if (color === 'red') return "border-red-500/30"
  if (color === 'purple') return "border-purple-500/30"
  return "border-slate-500/30"
}

function getHoraDot(color?: string) {
  if (color === 'gold') return "bg-yellow-500 text-yellow-500"
  if (color === 'green') return "bg-emerald-500 text-emerald-500"
  if (color === 'red') return "bg-red-500 text-red-500"
  if (color === 'purple') return "bg-purple-500 text-purple-500"
  return "bg-slate-500 text-slate-500"
}

function getHoraText(color?: string) {
  if (color === 'gold') return "text-yellow-400"
  if (color === 'green') return "text-emerald-400"
  if (color === 'red') return "text-red-400"
  if (color === 'purple') return "text-purple-400"
  return "text-slate-300"
}

export default HoraRoad
