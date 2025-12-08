"use client"

import type React from "react"
import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Plus, User, Trash2, LogOut, Sparkles, Calendar, Star, X, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { removeProfileFromFirebase } from "@/services/firebaseService"
import { useAuth } from "@/context/AuthContext"
import { NewChartModal } from "./NewChartModal"
import { ServicesButton } from "@/components/services"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onToggle, onClose }) => {
  const { savedProfiles, currentProfile, setCurrentProfile } = useAppStore()
  const { user, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Ensure profiles are loaded (though usually handled by DashboardLayout)
  // If "card" refers to the profile item, it's already rendered in the map.
  // If "card" refers to a specific "Current Profile" card at the top, it might be missing.
  // But based on the code, the list IS the cards.

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const handleDelete = async (id: string) => {
    if (user) await removeProfileFromFirebase(user.uid, id)
  }

  return (
    <aside className="h-full flex flex-col w-full font-sans">
      {/* HEADER */}
      <div className="p-6 border-b border-violet-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-sm font-medium text-violet-100 tracking-wide">My Charts</h2>
              <p className="text-[10px] text-violet-400/60 uppercase tracking-widest">Vedic Library</p>
            </div>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-violet-400/60 hover:text-violet-200 hover:bg-violet-500/10 rounded-lg transition-all"
            >
              <X size={18} />
            </motion.button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <AnimatePresence>
          {savedProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setCurrentProfile(profile)
                if (onClose) onClose()
              }}
              className={`
                group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border
                ${
                  currentProfile?.id === profile.id
                    ? "bg-gradient-to-r from-violet-500/20 to-rose-500/20 border-violet-400/30 shadow-lg shadow-violet-500/10"
                    : "bg-violet-950/20 border-transparent hover:bg-violet-900/30 hover:border-violet-500/10"
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`
                    p-2 rounded-xl transition-all
                    ${
                      currentProfile?.id === profile.id
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-violet-950/40 text-violet-400/60 group-hover:text-violet-300"
                    }
                  `}
                >
                  <User size={16} />
                </motion.div>
                <div className="min-w-0">
                  <h3
                    className={`font-medium text-sm truncate transition-colors ${
                      currentProfile?.id === profile.id
                        ? "text-violet-100"
                        : "text-violet-200/80 group-hover:text-violet-100"
                    }`}
                  >
                    {profile.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={10} className="text-violet-400/40" />
                    <p
                      className={`text-[10px] ${
                        currentProfile?.id === profile.id ? "text-violet-300/70" : "text-violet-400/50"
                      }`}
                    >
                      {profile.date}
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(profile.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {savedProfiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}>
              <Star className="w-8 h-8 text-violet-500/30 mb-3" />
            </motion.div>
            <p className="text-violet-400/40 text-xs">No charts yet</p>
          </motion.div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-violet-500/10 space-y-3">
        <ServicesButton 
            variant="full" 
            className="w-full"
            onServiceClick={(service) => {
                if (service.href) router.push(service.href)
            }}
        />

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-500 to-rose-500 text-white rounded-2xl shadow-lg shadow-violet-500/20 font-medium transition-all"
        >
          <Plus size={18} />
          <span>New Chart</span>
        </motion.button>
        
        <div className="flex gap-2">
            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/'}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-violet-400/60 hover:text-violet-300 hover:bg-violet-500/5 rounded-xl transition-all"
            >
            <Home size={14} />
            <span className="text-sm">Home</span>
            </motion.button>

            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-violet-400/60 hover:text-violet-300 hover:bg-violet-500/5 rounded-xl transition-all"
            >
            <LogOut size={14} />
            <span className="text-sm">Sign Out</span>
            </motion.button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>{isModalOpen && <NewChartModal onClose={() => setIsModalOpen(false)} />}</AnimatePresence>
    </aside>
  )
}
