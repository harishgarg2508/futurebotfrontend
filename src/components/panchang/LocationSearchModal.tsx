"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Calendar, Loader2 } from "lucide-react"

interface LocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (lat: number, lon: number, timezone: string, city: string) => void
  onDateUpdate: (date: string) => void
  currentDate: string
  currentCity: string
}

import { useModalBackHandler } from "@/hooks/useModalBackHandler"

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onDateUpdate,
  currentDate,
  currentCity,
}) => {
  useModalBackHandler(isOpen, onClose)
  const [query, setQuery] = useState("")
  const [date, setDate] = useState(currentDate)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 3) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              "User-Agent": "AstroVedicApp/1.0 (rishu@example.com)",
              "Referer": "https://futurebot-app.com",
              "Accept-Language": "en-US,en;q=0.9",
            },
          },
        )
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Search failed", error)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  useEffect(() => {
    if (isOpen) setDate(currentDate)
  }, [isOpen, currentDate])

  const handleSelectLocation = (place: any) => {
    const lat = Number.parseFloat(place.lat)
    const lon = Number.parseFloat(place.lon)
    const name = place.display_name.split(",")[0]
    onUpdate(lat, lon, "Asia/Kolkata", name)
    onClose()
  }

  const handleDateConfirm = () => {
    onDateUpdate(date)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

          {/* Ambient cosmic glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            className="relative w-full max-w-md cosmic-glass-intense rounded-t-3xl md:rounded-3xl p-6 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            onClick={(e) => e.stopPropagation()}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Drag Handle (Mobile) */}
            <div className="w-12 h-1.5 bg-violet-500/30 rounded-full mx-auto mb-6 md:hidden" />

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 tracking-wide">
              <MapPin className="text-amber-400" size={20} />
              Change Location & Date
            </h3>

            {/* 1. Date Picker */}
            <div className="mb-6">
              <label className="text-xs text-violet-300/50 font-bold uppercase tracking-wider mb-2 block">
                Select Date
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full cosmic-glass rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <Calendar
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400/50 pointer-events-none"
                    size={18}
                  />
                </div>
                <button
                  onClick={handleDateConfirm}
                  className={`px-4 py-2 rounded-xl cosmic-glass border border-amber-500/30 text-amber-400 font-medium hover:bg-amber-500/10 transition-colors ${date === currentDate ? "opacity-50" : "opacity-100"}`}
                >
                  Update
                </button>
              </div>
            </div>

            {/* 2. Location Search */}
            <div className="mb-2">
              <label className="text-xs text-violet-300/50 font-bold uppercase tracking-wider mb-2 block">
                Search City
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/50" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Mumbai, New York"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full cosmic-glass rounded-xl pl-12 pr-4 py-3 text-white placeholder-violet-300/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                {loading && (
                  <Loader2
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 animate-spin"
                    size={18}
                  />
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="relative h-[200px]">
              <div className="absolute inset-0 overflow-y-auto pr-2 cosmic-scrollbar">
                {results.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {results.map((place, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectLocation(place)}
                        className="w-full text-left p-3 rounded-lg cosmic-glass hover:border-violet-500/30 transition-all group"
                      >
                        <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {place.display_name.split(",")[0]}
                        </div>
                        <div className="text-xs text-violet-300/40 truncate">{place.display_name}</div>
                      </button>
                    ))}
                  </div>
                ) : query.length > 2 && !loading ? (
                  <div className="text-center text-violet-300/40 py-8 text-sm">No cities found.</div>
                ) : query.length === 0 ? (
                  <div className="text-center text-violet-300/30 py-8 text-xs">
                    Current: <span className="text-amber-400/60">{currentCity || "Unknown"}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-violet-500/10 text-center">
              <button onClick={onClose} className="text-sm text-violet-300/50 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LocationSearchModal
