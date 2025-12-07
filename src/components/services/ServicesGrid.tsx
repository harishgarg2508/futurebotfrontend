"use client"

import { motion } from "framer-motion"
import { ASTROLOGY_SERVICES, type ServiceConfig } from "./services-data"
import { ServiceIcon } from "./ServiceIcon"

interface ServicesGridProps {
  onServiceClick?: (service: ServiceConfig) => void
  title?: string
  showTitle?: boolean
  size?: "sm" | "md" | "lg"
  maxServices?: number
}

export function ServicesGrid({
  onServiceClick,
  title = "Celestial Services",
  showTitle = true,
  size = "md",
  maxServices,
}: ServicesGridProps) {
  const services = maxServices ? ASTROLOGY_SERVICES.slice(0, maxServices) : ASTROLOGY_SERVICES

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      {showTitle && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2 tracking-wide">{title}</h2>
          <p className="text-slate-400 text-sm">Explore the cosmic wisdom</p>
          {/* Decorative line */}
          <motion.div
            className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      )}

      {/* Services Grid */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {services.map((service, index) => (
          <ServiceIcon key={service.id} service={service} index={index} onClick={onServiceClick} size={size} />
        ))}
      </div>
    </motion.div>
  )
}
