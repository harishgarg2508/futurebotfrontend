"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import type { ServiceConfig } from "./services-data"

interface ServiceIconProps {
  service: ServiceConfig
  index: number
  onClick?: (service: ServiceConfig) => void
  size?: "sm" | "md" | "lg"
}

export function ServiceIcon({ service, index, onClick, size = "md" }: ServiceIconProps) {
  const router = useRouter()

  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-20 h-20 text-2xl",
    lg: "w-24 h-24 text-3xl",
  }

  const containerSizes = {
    sm: "w-20",
    md: "w-24",
    lg: "w-28",
  }

  const handleClick = () => {
    if (onClick) {
      onClick(service)
    } else if (service.href) {
      router.push(service.href)
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`${containerSizes[size]} flex flex-col items-center gap-2 group cursor-pointer`}
    >
      {/* Glowing Icon Container */}
      <div className="relative">
        {/* Ambient glow */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 blur-xl group-hover:opacity-60`}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        />

        {/* Icon background */}
        <motion.div
          className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-white/30 transition-colors duration-300`}
          animate={{
            boxShadow: [`0 0 20px ${service.color}20`, `0 0 30px ${service.color}30`, `0 0 20px ${service.color}20`],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 0.15,
          }}
        >
          {/* Inner gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
          />

          {/* Floating particles inside icon */}
          <motion.div
            className="absolute w-1 h-1 rounded-full bg-white/40"
            animate={{
              x: [-8, 8, -8],
              y: [-8, 8, -8],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: index * 0.1 }}
          />

          {/* Planet/Service symbol */}
          <motion.span
            className="relative z-10 font-serif"
            style={{ color: service.color }}
            animate={{
              textShadow: [`0 0 10px ${service.color}60`, `0 0 20px ${service.color}80`, `0 0 10px ${service.color}60`],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: index * 0.1,
            }}
          >
            {service.icon}
          </motion.span>
        </motion.div>
      </div>

      {/* Service name */}
      <motion.span
        className="text-xs text-slate-300 font-medium text-center group-hover:text-white transition-colors duration-300 leading-tight"
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
      >
        {service.name}
      </motion.span>
    </motion.button>
  )
}
