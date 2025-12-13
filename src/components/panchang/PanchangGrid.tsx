"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { CoreData, Widgets } from "@/types/panchang"
import { useTranslation } from "react-i18next";

interface PanchangGridProps {
  coreData: CoreData
  widgets: Widgets
}

const PanchangGrid: React.FC<PanchangGridProps> = ({ coreData, widgets }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4 p-4 -mt-6 z-20 relative">
      <PanchangCard
        title={t('panchang_grid.tithi', 'Tithi')}
        value={t('tithi.' + coreData.tithi.name.toLowerCase().split(' ')[0], { defaultValue: coreData.tithi.name })}
        subValue={`${t('panchang_grid.ends', 'Ends')}: ${coreData.tithi.ends_at}`}
        detail={`${t('panchang_grid.paksha', 'Paksha')}: ${t('paksha.' + coreData.tithi.paksha.toLowerCase(), { defaultValue: coreData.tithi.paksha })}. ${t('panchang_grid.daily_mood', 'It determines the daily mood.')}`}
      />

      <PanchangCard
        title={t('panchang_grid.nakshatra', 'Nakshatra')}
        value={t('nakshatras.' + coreData.nakshatra.name.toLowerCase(), { defaultValue: coreData.nakshatra.name })}
        subValue={`${t('panchang_grid.ends', 'Ends')}: ${coreData.nakshatra.ends_at}`}
        detail={t('panchang_grid.constellation', 'The star constellation the Moon is traveling through.')}
      />

      <PanchangCard
        title={t('panchang_grid.yoga', 'Yoga')}
        value={t('yogas.' + coreData.yoga.name.toLowerCase(), { defaultValue: coreData.yoga.name })}
        subValue={t('panchang_grid.daily_luck', 'Daily Luck')}
        detail={t('panchang_grid.yoga_desc', 'Mathematical combination of Sun and Moon affecting outcomes.')}
      />

      <PanchangCard
        title={t('panchang_grid.disha_shool', 'Disha Shool')}
        value={widgets.disha_shool.direction}
        subValue={t('panchang_grid.avoid_travel', 'Avoid Travel')}
        detail={`${t('panchang_grid.remedy', 'Remedy')}: ${widgets.disha_shool.remedy}`}
        isWarning
      />

      {/* Special Muhurats */}
      <div className="col-span-2 mt-2">
        <h3 className="text-violet-200/80 text-xs font-bold uppercase tracking-widest mb-2 pl-1">{t('panchang_grid.special_muhurats', 'Special Muhurats')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <PanchangCard
            title={t('panchang_grid.brahma', 'Brahma Muhurat')}
            value={widgets.special_muhurats.brahma_muhurat}
            subValue={t('panchang_grid.meditation', 'Meditation')}
            detail={t('panchang_grid.brahma_desc', 'Best time for spiritual practices.')}
          />
          <PanchangCard
            title={t('panchang_grid.abhijit', 'Abhijit')}
            value={
              widgets.special_muhurats.abhijit_muhurat.start === "N/A"
                ? "N/A"
                : `${widgets.special_muhurats.abhijit_muhurat.start} - ${widgets.special_muhurats.abhijit_muhurat.end}`
            }
            subValue={t('panchang_grid.victory', 'Victory Time')}
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

      <h4 className="text-xs text-violet-200/80 font-bold uppercase tracking-wider mb-1">{title}</h4>
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
