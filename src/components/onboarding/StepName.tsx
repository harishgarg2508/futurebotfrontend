"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, LogIn } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import FloatingStars from "./FloatingStars"
interface StepNameProps {
  onNext: (name: string) => void
  onDirectLogin?: () => void
}

const StepName: React.FC<StepNameProps> = ({ onNext, onDirectLogin }) => {
  const { signInWithGoogle } = useAuth()
  const [name, setName] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onNext(name)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      if (onDirectLogin) {
        onDirectLogin()
      }
    } catch (err) {
      console.error("Login failed", err)
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
              <div className="absolute inset-0 bg-[var(--color-lavender)] blur-2xl opacity-30 rounded-full scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-lavender)] to-[var(--color-violet)] flex items-center justify-center shadow-lg">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center space-y-3">
            <motion.p
              className="text-[var(--color-lavender)] text-sm font-medium tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-light text-[var(--color-light)] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              What's your name?
            </motion.h1>
            <motion.p
              className="text-[var(--color-muted)] text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Let's begin your celestial journey
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
                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--color-lavender)] to-[var(--color-violet)] opacity-0 blur-xl transition-opacity duration-500"
                animate={{ opacity: isFocused ? 0.3 : 0 }}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your name"
                className="relative w-full px-6 py-5 text-xl text-center serene-input placeholder:text-[var(--color-dim)]"
                autoFocus
              />
            </div>

            <motion.button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl btn-celestial text-lg font-medium flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.form>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === 0 ? "w-8 bg-[var(--color-lavender)]" : "w-1.5 bg-[var(--color-muted)]/30"
                }`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              />
            ))}
          </div>

          {/* Sign in link for existing users */}
          <motion.div
            className="flex justify-center pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-lavender)] transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Already have an account? Sign in</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default StepName
