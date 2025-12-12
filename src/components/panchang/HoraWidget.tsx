"use client"

import type React from "react"
import { useState } from "react"
import type { HoraSlot } from "@/types/panchang"
import { motion, AnimatePresence } from "framer-motion"

interface HoraWidgetProps {
  data: HoraSlot[]
  currentTime?: string
  onHoraClick?: (planet: string) => void
}

const HoraWidget: React.FC<HoraWidgetProps> = ({ data, currentTime, onHoraClick }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Find current Hora
  const currentHora = data.find(slot => {
    if (!currentTime) return false
    if (slot.start_time > slot.end_time) {
      return currentTime >= slot.start_time || currentTime < slot.end_time
    }
    return currentTime >= slot.start_time && currentTime < slot.end_time
  })

  const planetEmoji: Record<string, string> = {
    Sun: "☀️",
    Moon: "🌙",
    Mars: "🔴",
    Mercury: "☿️",
    Jupiter: "🪐",
    Venus: "♀️",
    Saturn: "🪐"
  }

  return (
    <div className="mx-4 mt-3 rounded-xl cosmic-glass border border-yellow-500/20 relative overflow-hidden z-10">
      {/* Subtle glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full cosmic-glass border border-yellow-500/30 flex items-center justify-center animate-cosmic-pulse">
            <span className="text-lg filter drop-shadow-lg">{currentHora ? planetEmoji[currentHora.planet] || "⭐" : "⭐"}</span>
          </div>
          <div>
            <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Hora</h4>
            <p className="text-xs text-yellow-300/40">Planetary Hours</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentHora && (
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-200 font-mono tracking-wide">
                {currentHora.start_time} - {currentHora.end_time}
              </div>
              <div className="text-xs text-yellow-300/60">{currentHora.planet} Hora</div>
            </div>
          )}
          
          <div className={`text-xl transition-transform duration-300 ${isOpen ? "rotate-180" : ""} text-yellow-400/50 ml-2`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-2">
              {data.map((slot, idx) => {
                const isActive = currentHora?.slot === slot.slot
                return (
                  <div
                    key={idx}
                    onClick={() => onHoraClick?.(slot.planet)}
                    className={`rounded-lg p-3 flex items-center justify-between relative transition-all duration-300 cursor-pointer
                      ${isActive 
                        ? "border border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]" 
                        : "cosmic-glass hover:bg-white/5"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${isActive ? "bg-yellow-500/20" : "bg-white/5"} flex items-center justify-center text-sm`}>
                        {planetEmoji[slot.planet] || "⭐"}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isActive ? "text-yellow-200" : "text-white/80"}`}>
                          {slot.planet}
                        </div>
                        <div className={`text-[10px] ${isActive ? "text-yellow-300/60" : "text-white/40"}`}>
                          {slot.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xs font-mono ${isActive ? "text-yellow-200" : "text-white/60"}`}>
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div className={`text-[10px] ${isActive ? "text-yellow-300/60" : "text-white/40"}`}>
                        {slot.is_night ? "Night" : "Day"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HoraWidget
