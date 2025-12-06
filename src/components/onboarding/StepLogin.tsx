"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, LogIn, Shield, Sparkles, Star, User } from "lucide-react"
import FloatingStars from "./FloatingStars"

interface StepLoginProps {
  onLogin: () => void
  onBack: () => void
}

const StepLogin: React.FC<StepLoginProps> = ({ onLogin, onBack }) => {
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
        <div className="w-full max-w-md space-y-12 text-center">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 opacity-20">
            <Star className="w-4 h-4 text-[#ffd23f]" fill="#ffd23f" />
          </div>
          <div className="absolute top-32 right-16 opacity-30">
            <Star className="w-3 h-3 text-[#ff8c42]" fill="#ff8c42" />
          </div>
          <div className="absolute bottom-40 left-20 opacity-25">
            <Sparkles className="w-5 h-5 text-[#9d4edd]" />
          </div>

          {/* Icon */}
          <motion.div
            className="flex justify-center"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9d4edd] to-[#ff8c42] blur-2xl opacity-40 rounded-full scale-150" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#9d4edd] via-[#c77dff] to-[#ff8c42] flex items-center justify-center shadow-lg shadow-[#9d4edd]/30">
                <div className="absolute inset-1 rounded-full bg-[#0a0612]/50 backdrop-blur-sm" />
                <User className="relative w-10 h-10 text-[#ffd23f]" />
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center space-y-4">
            <motion.p
              className="text-[#ff8c42] text-sm font-medium tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Final Step
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-light text-[#f4f0ff] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-[#ffd23f] via-[#ff8c42] to-[#9d4edd] bg-clip-text text-transparent">
                Sign In
              </span>
            </motion.h1>
            <motion.p
              className="text-[#a89ec4] text-lg max-w-sm mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Secure your celestial profile and unlock personalized cosmic insights
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a0f2e]/60 border border-[#9d4edd]/20 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9d4edd]/30 to-[#ff8c42]/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#ffd23f]" />
              </div>
              <div className="text-left">
                <p className="text-[#f4f0ff] font-medium">Secure & Private</p>
                <p className="text-[#a89ec4] text-sm">Your birth data is encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a0f2e]/60 border border-[#9d4edd]/20 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff8c42]/30 to-[#ffd23f]/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#ff8c42]" />
              </div>
              <div className="text-left">
                <p className="text-[#f4f0ff] font-medium">Personalized Readings</p>
                <p className="text-[#a89ec4] text-sm">AI-powered Vedic insights</p>
              </div>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={onLogin}
              className="group w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-[#ff8c42] to-[#ffd23f] text-[#0a0612] font-semibold text-lg shadow-lg shadow-[#ff8c42]/30 hover:shadow-xl hover:shadow-[#ff8c42]/40 hover:scale-[1.02] transition-all duration-300"
            >
              <LogIn className="w-5 h-5" />
              <span>Continue with Google</span>
              <motion.div
                className="ml-1"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                →
              </motion.div>
            </button>

            <button
              onClick={onBack}
              className="group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-transparent border border-[#9d4edd]/40 text-[#f4f0ff] font-medium hover:bg-[#9d4edd]/10 hover:border-[#9d4edd]/60 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Terms */}
          <motion.p
            className="text-[#a89ec4]/60 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </div>
      </motion.div>
    </>
  )
}

export default StepLogin
