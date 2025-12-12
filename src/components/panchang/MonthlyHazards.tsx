"use client"

import type React from "react"
import { useState } from "react"
import type { MonthlyHazards } from "@/types/panchang"
import { motion, AnimatePresence } from "framer-motion"

interface MonthlyHazardsProps {
  data: MonthlyHazards
  currentDate: string
}

const MonthlyHazardsComponent: React.FC<MonthlyHazardsProps> = ({ data, currentDate }) => {
  return (
    <div className="p-4 space-y-3 pb-24">
      <HazardAccordion
        title="⚠️ Panchak Dates"
        subtitle="5 Bad Days (Avoid South Travel / Roof Construction)"
        items={data.panchak_dates.map((d) => ({ date: d, note: "Panchak Active" }))}
        color="orange"
        currentDate={currentDate}
      />

      <HazardAccordion
        title="🚫 Bhadra Timings"
        subtitle="Toxic Time (Avoid New Business)"
        items={data.bhadra_dates.map((d) => ({ date: d.date, note: d.avoid || "Avoid" }))}
        color="red"
        currentDate={currentDate}
      />
    </div>
  )
}

const HazardAccordion: React.FC<{
  title: string
  subtitle: string
  items: { date: string; note: string }[]
  color: "red" | "orange"
  currentDate: string
}> = ({ title, subtitle, items, color, currentDate }) => {
  const [isOpen, setIsOpen] = useState(false)

  const isAnyActive = items.some(item => item.date === currentDate);

  const borderColor = color === "red" ? "border-red-500/20" : "border-orange-500/20"
  const glowColor = color === "red" ? "bg-red-500/5" : "bg-orange-500/5"
  const titleColor = color === "red" ? "text-red-400" : "text-orange-400"
  const activeDotColor = color === "red" ? "bg-red-500" : "bg-orange-500"

  return (
    <div className={`rounded-xl cosmic-glass ${borderColor} overflow-hidden relative`}>
      {/* Subtle ambient glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${glowColor} rounded-full blur-3xl pointer-events-none`} />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="relative">
            <h4 className={`text-sm font-bold ${titleColor} flex items-center gap-2`}>
                {title}
                {isAnyActive && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeDotColor} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeDotColor}`}></span>
                    </span>
                )}
            </h4>
          <p className="text-xs text-violet-300/40">{subtitle}</p>
        </div>
        <div className={`text-xl transition-transform duration-300 ${isOpen ? "rotate-180" : ""} text-violet-400/50`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              {items.slice(0, 6).map((item, idx) => {
                  const isActive = item.date === currentDate;
                  return (
                    <div 
                        key={idx} 
                        className={`rounded-lg p-2 text-center relative transition-all duration-300
                            ${isActive 
                                ? `border ${borderColor} bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]` 
                                : "cosmic-glass"
                            }
                        `}
                    >
                      {isActive && (
                        <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${activeDotColor} animate-pulse`} />
                      )}
                      
                      <div className={`text-sm font-bold ${isActive ? "text-white scale-105" : "text-white/80"}`}>
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className={`text-[10px] ${isActive ? "text-white/60" : "text-violet-300/40"}`}>{item.note}</div>
                    </div>
                  )
              })}
              {items.length > 6 && (
                <div className="col-span-2 text-center text-xs text-violet-300/50 py-2">
                  + {items.length - 6} more dates
                </div>
              )}
              {items.length === 0 && (
                <div className="col-span-2 text-center text-violet-300/40 py-2">No upcoming threats.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MonthlyHazardsComponent
