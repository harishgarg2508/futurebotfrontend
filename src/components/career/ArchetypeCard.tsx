"use client"

import type React from "react"
import { motion } from "framer-motion"

interface ArchetypeCardProps {
  archetype: string
  description?: string
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ archetype, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl text-center overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent blur-sm"></div>

      <div className="relative z-10">
        <motion.span
          className="text-violet-400/80 text-sm font-medium tracking-[0.3em] uppercase mb-4 block"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          Your Cosmic Archetype
        </motion.span>

        <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-violet-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent mb-6 leading-tight">
          {archetype}
        </h2>

        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent mx-auto my-6"></div>

        <p className="text-violet-200/70 text-lg leading-relaxed max-w-2xl mx-auto font-light">
          {description || "A unique synthesis of planetary energies creating your destined path to success."}
        </p>

        {/* Floating decorative elements */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
            style={{
              left: `${25 + i * 20}%`,
              bottom: `${20 + (i % 2) * 10}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default ArchetypeCard
