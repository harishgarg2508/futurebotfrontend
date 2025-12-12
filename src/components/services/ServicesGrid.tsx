"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ASTROLOGY_SERVICES, type ServiceConfig } from "./services-data"
import { ServiceIcon } from "./ServiceIcon"
import { useTranslation } from "react-i18next"
import { CosmicOrb } from "@/components/ui/CosmicOrb"

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
  const router = useRouter()
  const [loadingServiceId, setLoadingServiceId] = useState<string | null>(null)
  
  const servicesData = maxServices ? ASTROLOGY_SERVICES.slice(0, maxServices) : ASTROLOGY_SERVICES
  
  // Translate title if it's the default (or if passed as a key, but usually it's passed as string).
  // If title is undefined, we use default text "Celestial Services" but translated.
  const displayTitle = title || t('celestial_services', 'Celestial Services')

  const translatedServices = servicesData.map(service => ({
    ...service,
    name: t(`services.${service.id}.title`, { defaultValue: service.name }),
    description: t(`services.${service.id}.desc`, { defaultValue: service.description })
  }))

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleServiceClick = (service: ServiceConfig) => {
    setLoadingServiceId(service.id)
    
    // Simulate loading delay for "acting"
    setTimeout(() => {
        if (onServiceClick) {
            onServiceClick(service)
        } else if (service.href) {
            router.push(service.href)
        }
        // We don't reset loading immediately to prevent flash before navigation
        // But if it's a modal action (like 'ask-question'), we might need to reset
        if (service.id === 'ask-question') {
             setLoadingServiceId(null)
        }
    }, 2000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loadingServiceId && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <CosmicOrb />
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-violet-200 font-light tracking-widest uppercase text-sm"
                >
                    Aligning Cosmic Energies...
                </motion.p>
            </motion.div>
        )}
      </AnimatePresence>

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
      <div className="grid grid-cols-4 sm:grid-cols-4 md:flex md:flex-wrap justify-center gap-2 md:gap-6 px-2">
        {translatedServices.map((service, index) => (
          <div key={service.id} className="flex justify-center">
             <ServiceIcon 
                service={service} 
                index={index} 
                onClick={handleServiceClick} 
                size={isMobile ? "sm" : size} 
             />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
