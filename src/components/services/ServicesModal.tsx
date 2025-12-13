"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { ASTROLOGY_SERVICES, type ServiceConfig } from "./services-data"
import { ServiceIcon } from "./ServiceIcon"

interface ServicesModalProps {
  isOpen: boolean
  onClose: () => void
  onServiceClick?: (service: ServiceConfig) => void
}

import { useModalBackHandler } from "@/hooks/useModalBackHandler"

export function ServicesModal({ isOpen, onClose, onServiceClick }: ServicesModalProps) {
  useModalBackHandler(isOpen, onClose)
  const handleServiceClick = (service: ServiceConfig) => {
    onServiceClick?.(service)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
            onClick={onClose}
          >
            {/* Cosmic background */}
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />

            {/* Animated stars background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.1, 0.8, 0.1],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Floating orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-2xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-rose-500/20 backdrop-blur-sm border border-white/10 mb-4"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(167, 139, 250, 0.3)",
                      "0 0 40px rgba(167, 139, 250, 0.5)",
                      "0 0 20px rgba(167, 139, 250, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <motion.span
                    className="text-3xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    ✦
                  </motion.span>
                </motion.div>
                <h2 className="text-2xl font-light text-white tracking-wide mb-2">Celestial Services</h2>
                <p className="text-slate-400 text-sm">Choose your cosmic journey</p>
                <motion.div
                  className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>

              {/* Services Grid */}
              <div className="flex flex-wrap justify-center gap-5">
                {ASTROLOGY_SERVICES.map((service, index) => (
                  <ServiceIcon
                    key={service.id}
                    service={service}
                    index={index}
                    onClick={handleServiceClick}
                    size="lg"
                  />
                ))}
              </div>

              {/* Footer hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-slate-500 text-xs mt-8"
              >
                Tap anywhere outside to close
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
