"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Clock } from "lucide-react"
import FloatingStars from "./FloatingStars"
interface StepTimeProps {
  onNext: (time: string) => void
  onBack: () => void
}

const StepTime: React.FC<StepTimeProps> = ({ onNext, onBack }) => {
  const [time, setTime] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (time) {
      onNext(time)
    }
  }

  return (
    <>
      <FloatingStars />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center justify-center min-h-screen w-full px-6 relative z-10"
      >
        <div className="w-full max-w-md space-y-12">
          {/* Icon */}
          <motion.div
            className="flex justify-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-amber)] blur-2xl opacity-25 rounded-full scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-peach)] flex items-center justify-center shadow-lg">
                <Clock className="w-9 h-9 text-[var(--color-void)]" />
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center space-y-3">
            <motion.p
              className="text-[var(--color-amber)] text-sm font-medium tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Birth Time
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-light text-[var(--color-light)] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              What time were you born?
            </motion.h1>
            <motion.p
              className="text-[var(--color-muted)] text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              This reveals your rising sign
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-peach)] opacity-0 blur-xl transition-opacity duration-500"
                animate={{ opacity: isFocused ? 0.25 : 0 }}
              />
              <div className="relative">
                <Clock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[var(--color-amber)] w-6 h-6 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full px-6 py-5 pl-16 text-2xl text-center serene-input"
                  required
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                type="button"
                onClick={onBack}
                className="px-6 py-4 rounded-2xl btn-ghost flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
              <motion.button
                type="submit"
                disabled={!time}
                className="flex-1 py-4 rounded-2xl btn-celestial text-lg font-medium flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.form>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= 2 ? "w-8 bg-[var(--color-lavender)]" : "w-1.5 bg-[var(--color-muted)]/30"
                }`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default StepTime
