"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Crown, Star, Sparkles } from "lucide-react"

interface HeroRevealProps {
  archetype: string
  score: number
  topCategory: string
}

const HeroReveal: React.FC<HeroRevealProps> = ({ archetype, score, topCategory }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const intervalTime = duration / steps
    const stepValue = score / steps

    let current = 0
    const timer = setInterval(() => {
      current += stepValue
      if (current >= score) {
        setCount(score)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [score])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-3xl mx-auto mb-16"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-2xl">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-violet-400 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"
        >
          <Crown size={16} className="animate-pulse" />
          <span>Cosmic Match</span>
        </motion.div>

        {/* Archetype Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-5xl md:text-7xl font-black bg-gradient-to-r from-violet-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent mb-4 tracking-tight leading-tight"
        >
          {archetype}
        </motion.h2>

        {/* Category Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl text-violet-300/70 font-light mb-10"
        >
          Destined for <span className="text-fuchsia-300 font-semibold">{topCategory}</span>
        </motion.p>

        <div className="relative inline-flex items-center justify-center">
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-30"></div>

          <svg className="w-44 h-44 transform -rotate-90 relative z-10">
            <circle
              cx="88"
              cy="88"
              r="75"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="75"
              stroke="url(#scoreGradient)"
              strokeWidth="6"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={471}
              strokeDashoffset={471 - (471 * score) / 100}
              initial={{ strokeDashoffset: 471 }}
              animate={{ strokeDashoffset: 471 - (471 * score) / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-5xl font-black bg-gradient-to-br from-violet-200 to-fuchsia-200 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {count}%
            </motion.span>
            <span className="text-xs text-violet-400/60 uppercase tracking-wider mt-2 font-medium">Confidence</span>
          </div>
        </div>

        {/* Decorative stars */}
        <motion.div
          className="absolute top-8 right-8 text-violet-400/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Sparkles size={24} />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-8 text-fuchsia-400/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Star size={20} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default HeroReveal
