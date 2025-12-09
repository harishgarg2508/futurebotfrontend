"use client"

import { motion } from "framer-motion"
import { ASTROLOGY_SERVICES, type ServiceConfig } from "./services-data"
import { ServiceIcon } from "./ServiceIcon"
import { useTranslation } from "react-i18next"

interface ServicesGridProps {
  onServiceClick?: (service: ServiceConfig) => void
  title?: string
  showTitle?: boolean
  size?: "sm" | "md" | "lg"
  maxServices?: number
}

export function ServicesGrid({
  onServiceClick,
  title,
  showTitle = true,
  size = "md",
  maxServices,
}: ServicesGridProps) {
  const { t } = useTranslation()
  const servicesData = maxServices ? ASTROLOGY_SERVICES.slice(0, maxServices) : ASTROLOGY_SERVICES
  
  // Translate title if it's the default (or if passed as a key, but usually it's passed as string).
  // If title is undefined, we use default text "Celestial Services" but translated.
  const displayTitle = title || t('celestial_services', 'Celestial Services')

  const translatedServices = servicesData.map(service => ({
    ...service,
    name: t(`services.${service.id}.title`, { defaultValue: service.name }),
    description: t(`services.${service.id}.desc`, { defaultValue: service.description })
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      {showTitle && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2 tracking-wide">{displayTitle}</h2>
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
        {translatedServices.map((service, index) => (
          <ServiceIcon key={service.id} service={service} index={index} onClick={onServiceClick} size={size} />
        ))}
      </div>
    </motion.div>
  )
}
