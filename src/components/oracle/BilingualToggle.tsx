"use client"

import type React from "react"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

export const BilingualToggle: React.FC = () => {
  const { language, setLanguage } = useAppStore()

  return (
    <div className="flex items-center bg-slate-900/60 backdrop-blur-sm border border-violet-400/20 rounded-xl p-1 relative">
      <motion.div
        layout
        className="absolute inset-y-1 bg-gradient-to-r from-violet-500 to-rose-500 rounded-lg shadow-lg shadow-violet-500/20"
        initial={false}
        animate={{
          x: language === "en" ? 0 : "100%",
          width: "50%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => setLanguage("en")}
        className={`relative z-10 px-4 py-1.5 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-lg ${
          language === "en" ? "text-white" : "text-slate-400 hover:text-slate-300"
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => setLanguage("hi")}
        className={`relative z-10 px-4 py-1.5 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-lg ${
          language === "hi" ? "text-white" : "text-slate-400 hover:text-slate-300"
        }`}
      >
        HIN
      </button>
    </div>
  )
}
