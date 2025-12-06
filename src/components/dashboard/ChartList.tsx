"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { motion } from "framer-motion"
import { Plus, User, Sparkles, Star, Calendar, MapPin } from "lucide-react"

interface ChartListProps {
  onSelectChart: (chart: any) => void
  onNewChart: () => void
}

const ChartList: React.FC<ChartListProps> = ({ onSelectChart, onNewChart }) => {
  const { user } = useAuth()
  const [charts, setCharts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCharts = async () => {
      if (!user) return
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "charts"))
        const chartsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setCharts(chartsData)
      } catch (error) {
        console.error("Error fetching charts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCharts()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="p-4"
        >
          <Sparkles className="w-8 h-8 text-violet-400" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h2 className="text-3xl font-light text-violet-100 mb-2">Your Cosmic Records</h2>
          <p className="text-violet-400/60 text-sm">Explore your celestial blueprints</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewChart}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-rose-500 text-white rounded-2xl shadow-lg shadow-violet-500/20 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Chart</span>
        </motion.button>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart, index) => (
          <motion.div
            key={chart.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => onSelectChart(chart)}
            className="group relative p-6 rounded-3xl cursor-pointer overflow-hidden"
          >
            {/* Card background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-[#1a1030]/80 to-indigo-950/60 backdrop-blur-xl border border-violet-500/10 rounded-3xl transition-all duration-300 group-hover:border-violet-400/30" />

            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-rose-500/0 rounded-3xl transition-all duration-500 group-hover:from-violet-500/5 group-hover:to-rose-500/5" />

            {/* Content */}
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="p-3 bg-gradient-to-br from-violet-500/20 to-rose-500/20 rounded-xl border border-violet-400/10 group-hover:border-violet-400/30 transition-all"
                >
                  <User className="w-6 h-6 text-violet-300" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-medium text-violet-100 group-hover:text-white transition-colors truncate">
                    {chart.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-violet-400/70">
                    <Calendar size={12} />
                    <span>{chart.date}</span>
                    <span className="text-violet-500/30">•</span>
                    <span>{chart.time}</span>
                  </div>
                </div>
              </div>

              {chart.location?.name && (
                <div className="flex items-center gap-2 text-xs text-violet-400/50 uppercase tracking-widest">
                  <MapPin size={10} />
                  <span className="truncate">{chart.location.name}</span>
                </div>
              )}

              {/* Decorative stars */}
              <motion.div
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Star className="w-4 h-4 text-violet-400/30" />
              </motion.div>
            </div>
          </motion.div>
        ))}

        {charts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="p-6 bg-violet-500/10 rounded-full mb-6"
            >
              <Sparkles className="w-10 h-10 text-violet-400" />
            </motion.div>
            <p className="text-violet-300/60 text-lg mb-2">No charts found</p>
            <p className="text-violet-400/40 text-sm">Create your first cosmic blueprint</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ChartList
