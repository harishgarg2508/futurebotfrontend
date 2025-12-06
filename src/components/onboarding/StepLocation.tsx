"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MapPin, Loader2, Navigation, ArrowLeft, Check } from "lucide-react"
import axios from "axios"
import FloatingStars from "./FloatingStars"
interface LocationData {
  name: string
  lat: number
  lon: number
}

interface StepLocationProps {
  onNext: (location: LocationData) => void
  onBack: () => void
}

const StepLocation: React.FC<StepLocationProps> = ({ onNext, onBack }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const searchLocation = async () => {
      if (query.length < 3) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { "Accept-Language": "en" } },
        )
        setResults(response.data)
      } catch (error) {
        console.error("Geocoding error:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchLocation, 1000)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          )
          const city = response.data.address.city || response.data.address.town || "Unknown Location"

          const loc = {
            name: city,
            lat: latitude,
            lon: longitude,
          }
          setSelectedLocation(loc)
          setQuery(city)
          setResults([])
        } catch (e) {
          console.error(e)
          const loc = {
            name: "Current Location",
            lat: latitude,
            lon: longitude,
          }
          setSelectedLocation(loc)
          setQuery("Current Location")
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error(err)
        setLoading(false)
        alert("Unable to retrieve location.")
      },
    )
  }

  const handleSelect = (result: any) => {
    const location = {
      name: result.display_name.split(",")[0],
      lat: Number.parseFloat(result.lat),
      lon: Number.parseFloat(result.lon),
    }
    setSelectedLocation(location)
    setQuery(location.name)
    setResults([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedLocation) {
      onNext(selectedLocation)
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
              <div className="absolute inset-0 bg-[var(--color-violet)] blur-2xl opacity-30 rounded-full scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-lavender)] flex items-center justify-center shadow-lg">
                <MapPin className="w-9 h-9 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center space-y-3">
            <motion.p
              className="text-[var(--color-violet)] text-sm font-medium tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Birth Place
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-light text-[var(--color-light)] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Where were you born?
            </motion.h1>
            <motion.p
              className="text-[var(--color-muted)] text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              We need coordinates for the stars
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-lavender)] opacity-0 blur-xl transition-opacity duration-500"
                animate={{ opacity: isFocused ? 0.25 : 0 }}
              />
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[var(--color-lavender)] w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedLocation(null)
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder="Search city..."
                  className="w-full px-6 py-5 pl-14 pr-14 text-lg serene-input"
                  autoFocus
                />

                {loading ? (
                  <Loader2 className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[var(--color-lavender)] w-5 h-5 animate-spin" />
                ) : (
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-[var(--color-lavender)]/10 rounded-full text-[var(--color-muted)] hover:text-[var(--color-lavender)] transition-colors"
                    title="Use Current Location"
                  >
                    <Navigation size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {results.length > 0 && !selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 serene-glass rounded-2xl max-h-60 overflow-y-auto custom-scrollbar"
                >
                  {results.map((result, index) => (
                    <motion.button
                      key={result.place_id}
                      type="button"
                      onClick={() => handleSelect(result)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full p-4 text-left hover:bg-[var(--color-lavender)]/10 text-[var(--color-light)] transition-colors border-b border-[var(--glass-border)] last:border-0"
                    >
                      <span className="font-medium block">{result.display_name.split(",")[0]}</span>
                      <span className="text-xs text-[var(--color-muted)] truncate block mt-1">
                        {result.display_name}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Location Badge */}
            <AnimatePresence>
              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-center gap-2 text-sm text-[var(--color-lavender)] bg-[var(--color-lavender)]/10 p-3 rounded-xl border border-[var(--color-lavender)]/20"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

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
                disabled={!selectedLocation}
                className="flex-1 py-4 rounded-2xl btn-celestial text-lg font-medium flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Reveal My Chart</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.form>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-8 h-1.5 rounded-full bg-[var(--color-lavender)]"
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

export default StepLocation
