"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react"
import FloatingStars from "./FloatingStars"

interface StepDateProps {
  name: string
  onNext: (date: string) => void
  onBack: () => void
}

const StepDate: React.FC<StepDateProps> = ({ name, onNext, onBack }) => {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (day && month && year) {
      const d = Number.parseInt(day)
      const y = Number.parseInt(year)
      if (d > 31 || d < 1) return
      if (y < 1900 || y > 2100) return
      const dateString = `${year}-${month}-${day.padStart(2, "0")}`
      onNext(dateString)
    }
  }

  const isValid = day && month && year

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
        <div className="w-full max-w-lg space-y-12">
          {/* Icon */}
          <motion.div
            className="flex justify-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-rose)] blur-2xl opacity-25 rounded-full scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-lavender)] flex items-center justify-center shadow-lg">
                <Calendar className="w-9 h-9 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center space-y-3">
            <motion.p
              className="text-[var(--color-rose)] text-sm font-medium tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Birth Date
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-light text-[var(--color-light)] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              When were you born?
            </motion.h1>
            <motion.p
              className="text-[var(--color-muted)] text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              The stars aligned on this special day
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
            <div className="flex gap-4 justify-center">
              {/* Day */}
              <div className="w-24 space-y-2">
                <input
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value.slice(0, 2))}
                  className="w-full px-4 py-4 text-2xl text-center serene-input"
                  autoFocus
                  required
                />
                <label className="block text-center text-xs text-[var(--color-muted)] uppercase tracking-wider">
                  Day
                </label>
              </div>

              {/* Month */}
              <div className="flex-1 space-y-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-4 text-lg text-center serene-input appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-[var(--color-void)] text-[var(--color-muted)]">
                    Month
                  </option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value} className="bg-[var(--color-void)] text-[var(--color-light)]">
                      {m.label}
                    </option>
                  ))}
                </select>
                <label className="block text-center text-xs text-[var(--color-muted)] uppercase tracking-wider">
                  Month
                </label>
              </div>

              {/* Year */}
              <div className="w-28 space-y-2">
                <input
                  type="number"
                  placeholder="YYYY"
                  min="1900"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value.slice(0, 4))}
                  className="w-full px-4 py-4 text-2xl text-center serene-input"
                  required
                />
                <label className="block text-center text-xs text-[var(--color-muted)] uppercase tracking-wider">
                  Year
                </label>
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
                disabled={!isValid}
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
                  i <= 1 ? "w-8 bg-[var(--color-lavender)]" : "w-1.5 bg-[var(--color-muted)]/30"
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

export default StepDate
