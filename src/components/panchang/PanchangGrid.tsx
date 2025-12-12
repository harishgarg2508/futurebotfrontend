"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { CoreData, Widgets } from "@/types/panchang"

interface PanchangGridProps {
  coreData: CoreData
  widgets: Widgets
}

const PanchangGrid: React.FC<PanchangGridProps> = ({ coreData, widgets }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 -mt-6 z-20 relative">
      <PanchangCard
        title="Tithi"
        value={coreData.tithi.name}
        subValue={`Ends: ${coreData.tithi.ends_at}`}
        detail={`${coreData.tithi.paksha} Paksha. It determines the daily mood.`}
      />

      <PanchangCard
        title="Nakshatra"
        value={coreData.nakshatra.name}
        subValue={`Ends: ${coreData.nakshatra.ends_at}`}
        detail="The star constellation the Moon is traveling through."
      />

      <PanchangCard
        title="Yoga"
        value={coreData.yoga.name}
        subValue="Daily Luck"
        detail="Mathematical combination of Sun and Moon affecting outcomes."
      />

      <PanchangCard
        title="Disha Shool"
        value={widgets.disha_shool.direction}
        subValue="Avoid Travel"
        detail={`Remedy: ${widgets.disha_shool.remedy}`}
        isWarning
      />

      {/* Special Muhurats */}
      <div className="col-span-2 mt-2">
        <h3 className="text-violet-300/40 text-xs font-bold uppercase tracking-widest mb-2 pl-1">Special Muhurats</h3>
        <div className="grid grid-cols-2 gap-4">
          <PanchangCard
            title="Brahma Muhurat"
            value={widgets.special_muhurats.brahma_muhurat}
            subValue="Meditation"
            detail="Best time for spiritual practices."
          />
          <PanchangCard
            title="Abhijit"
            value={
              widgets.special_muhurats.abhijit_muhurat.start === "N/A"
                ? "N/A"
                : `${widgets.special_muhurats.abhijit_muhurat.start} - ${widgets.special_muhurats.abhijit_muhurat.end}`
            }
            subValue="Victory Time"
            detail={widgets.special_muhurats.abhijit_muhurat.note}
          />
        </div>
      </div>
    </div>
  )
}

const PanchangCard: React.FC<{
  title: string
  value: string
  subValue: string
  detail?: string
  isWarning?: boolean
}> = ({ title, value, subValue, detail, isWarning }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      onClick={() => setIsOpen(!isOpen)}
      className={`relative overflow-hidden rounded-2xl p-4 cosmic-glass cursor-pointer transition-all duration-300 ${
        isWarning ? "border-red-500/20 hover:border-red-500/40" : "hover:border-violet-500/40"
      }`}
      whileTap={{ scale: 0.98 }}
    >
      {/* Corner Accent with cosmic glow */}
      <div
        className={`absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-20 blur-sm ${isWarning ? "bg-red-500" : "bg-amber-500"}`}
      />

      <h4 className="text-xs text-violet-300/50 font-bold uppercase tracking-wider mb-1">{title}</h4>
      <div className="text-lg font-semibold text-white truncate">{value}</div>
      <div className={`text-xs mt-1 ${isWarning ? "text-red-400/70" : "text-amber-400/70"}`}>{subValue}</div>

      <AnimatePresence>
        {isOpen && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-violet-500/10 text-xs text-violet-200/60 leading-relaxed">
              {detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PanchangGrid
