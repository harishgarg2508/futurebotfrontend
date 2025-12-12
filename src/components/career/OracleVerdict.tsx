"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Bot, Stars, Wand2 } from "lucide-react"

interface OracleVerdictProps {
  verdict: string
}

const OracleVerdict: React.FC<OracleVerdictProps> = ({ verdict }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    setDisplayedText("")
    setIsTyping(true)
    let index = 0

    const interval = setInterval(() => {
      if (index < verdict.length) {
        setDisplayedText((prev) => prev + verdict.charAt(index))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [verdict])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative mt-16"
    >
      {/* Magical glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>

      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 animate-pulse"></div>

        {/* Floating particles in background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-violet-400/40 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-8 md:p-10">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-lg opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="relative bg-gradient-to-br from-violet-500 to-fuchsia-500 p-3 rounded-2xl">
                <Wand2 size={24} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                Cosmic Intelligence Report
              </h3>
              <p className="text-violet-400/60 text-xs font-medium">Personalized astrological insights</p>
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Stars size={20} className="text-violet-400/40" />
            </motion.div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent mb-6"></div>

          {/* Content with beautiful typography */}
          <div className="relative">
            {/* Quote decoration */}
            <div className="absolute -left-2 top-0 text-6xl text-violet-400/10 font-serif leading-none">"</div>

            <div className="relative pl-6 pr-4 text-pretty">
              <p className="text-violet-100/90 text-lg leading-relaxed font-light tracking-wide">
                {displayedText}
                {isTyping && (
                  <motion.span
                    className="inline-block w-0.5 h-6 ml-1 bg-gradient-to-b from-violet-400 to-fuchsia-400 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                  />
                )}
              </p>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-400/40 text-xs">
              <Bot size={14} />
              <span className="font-medium">Powered by Vedic AI</span>
            </div>

            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Sparkles size={16} className="text-fuchsia-400/40" />
            </motion.div>
          </div>
        </div>

        {/* Bottom glow accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 opacity-50"></div>
      </div>
    </motion.div>
  )
}

export default OracleVerdict
