"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ServicesModal } from "./ServicesModal"
import type { ServiceConfig } from "./services-data"

interface ServicesButtonProps {
  onServiceClick?: (service: ServiceConfig) => void
  variant?: "icon" | "full"
  className?: string
}

export function ServicesButton({ onServiceClick, variant = "icon", className = "" }: ServicesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === "full") {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-rose-500/10 border border-white/10 hover:border-white/20 transition-all duration-300 ${className}`}
        >
          <motion.div
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 10px rgba(167, 139, 250, 0.2)",
                "0 0 20px rgba(167, 139, 250, 0.4)",
                "0 0 10px rgba(167, 139, 250, 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              ✦
            </motion.span>
          </motion.div>
          <div className="text-left">
            <p className="text-white text-sm font-medium">All Services</p>
            <p className="text-slate-400 text-xs">Explore cosmic wisdom</p>
          </div>
        </motion.button>

        <ServicesModal isOpen={isOpen} onClose={() => setIsOpen(false)} onServiceClick={onServiceClick} />
      </>
    )
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`relative p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 hover:border-white/30 transition-all duration-300 ${className}`}
      >
        {/* Glow effect */}
        <motion.div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-rose-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm" />

        <motion.span
          className="relative z-10 text-xl"
          animate={{
            rotate: 360,
            textShadow: [
              "0 0 10px rgba(167, 139, 250, 0.4)",
              "0 0 20px rgba(167, 139, 250, 0.6)",
              "0 0 10px rgba(167, 139, 250, 0.4)",
            ],
          }}
          transition={{
            rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            textShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY },
          }}
        >
          ✦
        </motion.span>
      </motion.button>

      <ServicesModal isOpen={isOpen} onClose={() => setIsOpen(false)} onServiceClick={onServiceClick} />
    </>
  )
}
