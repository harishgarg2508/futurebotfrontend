"use client"

import type React from "react"
import { useState } from "react"
import type { ChaughadiyaRoadmap, ChaughadiyaSlot } from "@/types/panchang"
import { motion, AnimatePresence } from "framer-motion"

interface ChaughadiyaWidgetProps {
  data: ChaughadiyaRoadmap
  currentTime?: string
  onChaughadiyaClick?: (name: string) => void
}

const ChaughadiyaWidget: React.FC<ChaughadiyaWidgetProps> = ({ data, currentTime, onChaughadiyaClick }) => {
  const [isOpen, setIsOpen] = useState(false)

  const currentChaughadiya = data.current

  const typeEmoji: Record<string, string> = {
    Amrit: "💎",
    Shubh: "✨",
    Labh: "💰",
    Chal: "🚶",
    Rog: "⚠️",
    Kaal: "☠️",
    Udveg: "😰"
  }

  const typeColor: Record<string, { border: string; bg: string; text: string }> = {
    Amrit: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-200" },
    Shubh: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-200" },
    Labh: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-200" },
    Chal: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-200" },
    Rog: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-200" },
    Kaal: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-200" },
    Udveg: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-200" }
  }

  const allSlots = [...data.day, ...data.night]

  return (
    <div className="mx-4 mt-3 rounded-xl cosmic-glass border border-violet-500/20 relative overflow-hidden z-10">
      {/* Subtle glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full cosmic-glass border border-violet-500/30 flex items-center justify-center animate-cosmic-pulse">
            <span className="text-lg filter drop-shadow-lg">{currentChaughadiya ? typeEmoji[currentChaughadiya.type] || "⏰" : "⏰"}</span>
          </div>
          <div>
            <h4 className="text-violet-400 font-bold text-sm uppercase tracking-wider">Chaughadiya</h4>
            <p className="text-xs text-violet-300/40">Muhurta Periods</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentChaughadiya && (
            <div className="text-right">
              <div className="text-lg font-bold text-violet-200 font-mono tracking-wide">
                {currentChaughadiya.start_time} - {currentChaughadiya.end_time}
              </div>
              <div className="text-xs text-violet-300/60">{currentChaughadiya.type}</div>
            </div>
          )}
          
          <div className={`text-xl transition-transform duration-300 ${isOpen ? "rotate-180" : ""} text-violet-400/50 ml-2`}>
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
              {allSlots.map((slot, idx) => {
                const isActive = currentChaughadiya?.slot === slot.slot
                const colors = typeColor[slot.type] || { border: "border-white/10", bg: "bg-white/5", text: "text-white" }
                
                return (
                  <div
                    key={idx}
                    onClick={() => onChaughadiyaClick?.(slot.type)}
                    className={`rounded-lg p-3 flex items-center justify-between relative transition-all duration-300 cursor-pointer
                      ${isActive 
                        ? `border ${colors.border} ${colors.bg} shadow-[0_0_15px_rgba(139,92,246,0.1)]` 
                        : "cosmic-glass hover:bg-white/5"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${isActive ? colors.bg : "bg-white/5"} flex items-center justify-center text-sm`}>
                        {typeEmoji[slot.type] || "⏰"}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isActive ? colors.text : "text-white/80"}`}>
                          {slot.type}
                        </div>
                        <div className={`text-[10px] ${isActive ? "text-white/60" : "text-white/40"}`}>
                          {slot.meaning}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xs font-mono ${isActive ? colors.text : "text-white/60"}`}>
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div className={`text-[10px] ${isActive ? "text-white/60" : "text-white/40"}`}>
                        Slot {slot.slot}
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

export default ChaughadiyaWidget
