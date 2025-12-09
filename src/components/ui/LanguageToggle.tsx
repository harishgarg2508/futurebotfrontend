"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { Languages } from "lucide-react"

export const LanguageToggle = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en"
    i18n.changeLanguage(newLang)
  }

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
    >
      <Languages size={16} />
      <span className="text-sm font-medium">{i18n.language === "en" ? "हिंदी" : "English"}</span>
    </motion.button>
  )
}
