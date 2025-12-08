"use client"

import React, { useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, User, Calendar, MapPin, ArrowLeft, Sparkles } from "lucide-react"
import { NewChartModal } from "@/components/library/NewChartModal"
import { VisualChart } from "@/components/sky/VisualChart"
import { useRouter } from "next/navigation"

export default function KundliPage() {
  const { savedProfiles, currentProfile, setCurrentProfile } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [view, setView] = useState<"list" | "detail">("list")
  const router = useRouter()

  const handleChartClick = (profile: any) => {
    setCurrentProfile(profile)
    setView("detail")
  }

  const handleBack = () => {
    setView("list")
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-[#0a0612] text-violet-100 font-sans">
      {/* Background Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-violet-300 hover:text-violet-100 transition-all mb-4 text-sm font-medium group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            <h1 className="text-3xl font-light tracking-tight">
              <span className="bg-gradient-to-r from-violet-200 to-rose-200 bg-clip-text text-transparent">
                Kundli Generation
              </span>
            </h1>
            <p className="text-violet-400/60 text-sm">Your Vedic Birth Charts Library</p>
          </div>
          
          {view === "list" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors shadow-lg shadow-violet-500/20"
            >
              <Plus size={18} />
              <span>Add New Chart</span>
            </motion.button>
          )}

          {view === "detail" && (
             <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-violet-900/50 hover:bg-violet-800/50 text-violet-200 rounded-xl transition-colors border border-violet-500/20"
            >
              <ArrowLeft size={18} />
              <span>Back to List</span>
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {savedProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleChartClick(profile)}
                  className="group relative p-6 rounded-2xl bg-violet-900/10 border border-violet-500/10 hover:bg-violet-900/20 hover:border-violet-500/30 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center text-violet-300">
                      <User size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-violet-100">{profile.name}</h3>
                      <div className="flex items-center gap-2 text-violet-400/60 text-sm">
                        <Calendar size={14} />
                        <span>{profile.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-violet-400/60 text-sm">
                        <MapPin size={14} />
                        <span>{profile.location?.city || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {savedProfiles.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-violet-400/50" />
                  </div>
                  <p className="text-violet-300/60">No charts found. Create one to begin.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Chart Visual */}
              <div className="lg:col-span-2 bg-violet-950/20 rounded-3xl border border-violet-500/10 overflow-hidden min-h-[500px] relative">
                 <VisualChart />
              </div>

              {/* Details Panel */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-violet-950/20 border border-violet-500/10 space-y-6">
                    <div>
                        <h3 className="text-violet-200 font-medium mb-1">Birth Details</h3>
                        <div className="space-y-3 text-sm text-violet-300/70">
                            <div className="flex justify-between py-2 border-b border-violet-500/10">
                                <span>Name</span>
                                <span className="text-violet-100">{currentProfile?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-violet-500/10">
                                <span>Date</span>
                                <span className="text-violet-100">{currentProfile?.date}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-violet-500/10">
                                <span>Time</span>
                                <span className="text-violet-100">{currentProfile?.time}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-violet-500/10">
                                <span>Place</span>
                                <span className="text-violet-100">{currentProfile?.location?.city}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && <NewChartModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
