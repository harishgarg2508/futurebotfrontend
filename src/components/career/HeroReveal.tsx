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
    <div className="relative w-full max-w-4xl mx-auto mb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl serene-glass p-8 md:p-12 border border-[var(--glass-border)] shadow-2xl">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-lavender)]/10 via-transparent to-[var(--color-violet)]/10 opacity-50"></div>
          
          {/* Floating Orbs Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-lavender)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-violet)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "2s" }}></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Icon / Avatar Section */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="relative shrink-0"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[var(--color-lavender)] to-[var(--color-violet)] p-1 shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                <div className="w-full h-full rounded-full bg-[#1a0b2e] flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
                    <Crown size={64} className="text-[var(--color-light)] relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Decorative Rings */}
              <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] pointer-events-none opacity-40 animate-[spin_10s_linear_infinite]">
                <circle cx="50%" cy="50%" r="48%" stroke="url(#gradient-ring)" strokeWidth="1" fill="none" strokeDasharray="10 10" />
                <defs>
                  <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Text Content */}
            <div className="text-center md:text-left flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-lavender)]/10 border border-[var(--color-lavender)]/20 text-[var(--color-lavender)] text-xs font-bold tracking-wider uppercase mb-4">
                  <Star size={12} fill="currentColor" />
                  <span>Primary Archetype</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-[var(--color-light)] mb-2 tracking-tight drop-shadow-lg">
                  {archetype}
                </h2>
                
                <div className="h-1 w-24 bg-gradient-to-r from-[var(--color-lavender)] to-transparent rounded-full mb-4 mx-auto md:mx-0"></div>
                
                <p className="text-[var(--color-lavender)]/80 text-lg font-light leading-relaxed">
                  Your cosmic signature dominates in the realm of <span className="text-[var(--color-light)] font-medium">{topCategory}</span>.
                </p>
              </motion.div>

              {/* Stats Row */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex items-center justify-center md:justify-start gap-8"
              >
                <div>
                    <div className="text-3xl font-bold text-[var(--color-light)]">{count}%</div>
                    <div className="text-xs text-[var(--color-lavender)]/60 uppercase tracking-wider">Match Strength</div>
                </div>
                <div className="w-px h-10 bg-[var(--color-lavender)]/20"></div>
                 <div>
                    <div className="text-3xl font-bold text-[var(--color-light)]">Tier 1</div>
                    <div className="text-xs text-[var(--color-lavender)]/60 uppercase tracking-wider">Cosmic Rank</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HeroReveal
