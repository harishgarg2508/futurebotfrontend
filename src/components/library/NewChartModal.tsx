"use client"

import type React from "react"
import { useState } from "react"
import { useAppStore, type ChartProfile } from "@/lib/store"
import { X, Calendar, MapPin, Search, Sparkles, User, Clock } from "lucide-react"
import { addProfileToFirebase } from "@/services/firebaseService"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

interface NewChartModalProps {
  onClose: () => void
}

export const NewChartModal: React.FC<NewChartModalProps> = ({ onClose }) => {
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile)
  const { user } = useAuth()

  const [name, setName] = useState("")
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [time, setTime] = useState("")
  const [locQuery, setLocQuery] = useState("")
  const [locResults, setLocResults] = useState<any[]>([])
  const [selectedLoc, setSelectedLoc] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [loadingLoc, setLoadingLoc] = useState(false)

  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ]

  const searchLocation = async (q: string) => {
    if (q.length < 3) return
    setLoadingLoc(true)
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
        headers: { "Accept-Language": "en" },
      })
      setLocResults(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingLoc(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoc) {
      alert("Please select a valid location from the search.")
      return
    }

    const finalDate = `${year}-${month}-${day.padStart(2, "0")}`

    const newProfile: ChartProfile = {
      id: crypto.randomUUID(),
      name: name,
      date: finalDate,
      time: time,
      location: {
        lat: selectedLoc.lat,
        lon: selectedLoc.lon,
        city: selectedLoc.name,
      },
    }

    if (user) {
      addProfileToFirebase(user.uid, newProfile)
    }

    setCurrentProfile(newProfile)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0f0a1f]/90 backdrop-blur-xl" onClick={onClose} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl"
        >
          {/* Glass card */}
          <div className="relative bg-gradient-to-br from-violet-950/80 via-[#1a1030]/90 to-indigo-950/80 backdrop-blur-2xl border border-violet-500/20 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-violet-500/10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="p-2.5 bg-gradient-to-br from-violet-500/20 to-rose-500/20 rounded-xl border border-violet-400/20"
                >
                  <Sparkles className="w-5 h-5 text-violet-300" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-medium text-violet-100">New Celestial Chart</h3>
                  <p className="text-xs text-violet-400/70">Map your cosmic blueprint</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-violet-400 hover:text-violet-200 hover:bg-violet-500/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-violet-300/80 uppercase tracking-wider">
                  <User size={12} />
                  Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-violet-950/40 border border-violet-500/20 rounded-2xl text-violet-100 placeholder-violet-400/40 focus:outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10 transition-all"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-violet-300/80 uppercase tracking-wider">
                  <Calendar size={12} />
                  Date of Birth
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="DD"
                    min="1"
                    max="31"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-20 p-4 bg-violet-950/40 border border-violet-500/20 rounded-2xl text-center text-violet-100 placeholder-violet-400/40 focus:outline-none focus:border-violet-400/40 transition-all"
                    required
                  />
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="flex-1 p-4 bg-violet-950/40 border border-violet-500/20 rounded-2xl text-center text-violet-100 focus:outline-none focus:border-violet-400/40 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled className="bg-[#1a1030]">
                      Month
                    </option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value} className="bg-[#1a1030]">
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="YYYY"
                    min="1900"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-28 p-4 bg-violet-950/40 border border-violet-500/20 rounded-2xl text-center text-violet-100 placeholder-violet-400/40 focus:outline-none focus:border-violet-400/40 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-violet-300/80 uppercase tracking-wider">
                  <Clock size={12} />
                  Time of Birth
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-4 bg-violet-950/40 border border-violet-500/20 rounded-2xl text-center text-violet-100 focus:outline-none focus:border-violet-400/40 transition-all"
                  style={{ colorScheme: "dark" }}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2 relative">
                <label className="flex items-center gap-2 text-xs font-medium text-violet-300/80 uppercase tracking-wider">
                  <MapPin size={12} />
                  Location
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search your birth city..."
                    value={locQuery}
                    onChange={(e) => {
                      setLocQuery(e.target.value)
                      if (e.target.value.length >= 3) searchLocation(e.target.value)
                    }}
                    className="w-full p-4 pl-11 bg-violet-950/40 border border-violet-500/20 rounded-2xl text-violet-100 placeholder-violet-400/40 focus:outline-none focus:border-violet-400/40 transition-all"
                  />
                  {loadingLoc && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full"
                      />
                    </div>
                  )}
                </div>

                {/* Dropdown Results */}
                <AnimatePresence>
                  {locResults.length > 0 && !selectedLoc && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-[#1a1030]/95 backdrop-blur-xl border border-violet-500/20 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-10 custom-scrollbar"
                    >
                      {locResults.map((res: any) => (
                        <motion.div
                          key={res.place_id}
                          whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                          onClick={() => {
                            setSelectedLoc({
                              lat: Number.parseFloat(res.lat),
                              lon: Number.parseFloat(res.lon),
                              name: res.display_name.split(",")[0],
                            })
                            setLocQuery(res.display_name.split(",")[0])
                            setLocResults([])
                          }}
                          className="p-4 cursor-pointer text-sm text-violet-200/80 border-b border-violet-500/10 last:border-0"
                        >
                          {res.display_name}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedLoc && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm"
                  >
                    <MapPin size={14} className="text-emerald-400" />
                    <span className="text-emerald-300">
                      {selectedLoc.name} ({selectedLoc.lat.toFixed(2)}, {selectedLoc.lon.toFixed(2)})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLoc(null)
                        setLocQuery("")
                      }}
                      className="ml-auto text-rose-400 hover:text-rose-300 text-xs underline"
                    >
                      Change
                    </button>
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 mt-4 bg-gradient-to-r from-violet-500 to-rose-500 text-white font-medium rounded-2xl shadow-lg shadow-violet-500/25 transition-all"
              >
                Create Chart
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
