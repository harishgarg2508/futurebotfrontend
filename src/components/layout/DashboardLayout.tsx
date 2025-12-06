"use client"

import React from "react"
import { Sidebar } from "@/components/library/Sidebar"
import { ChatInterface } from "@/components/oracle/ChatInterface"
import { VisualChart } from "@/components/sky/VisualChart"
import { useProfileSync } from "@/hooks/useProfileSync"
import { motion, AnimatePresence } from "framer-motion"
import { PanelRightOpen, PanelLeftOpen, X, PanelLeftClose, PanelRightClose } from "lucide-react"

export const DashboardLayout: React.FC = () => {
  useProfileSync()

  const [isLeftOpen, setIsLeftOpen] = React.useState(false)
  const [isRightOpen, setIsRightOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(true)

  // Check if we're on desktop and set initial state
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setIsLeftOpen(true)
        setIsRightOpen(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full overflow-hidden font-sans bg-[#0a0612]">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0612] via-[#0f0a1f] to-[#0d0918]">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />

        {/* Subtle stars */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-violet-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mobile Overlay for Left Sidebar */}
      <AnimatePresence>
        {isLeftOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLeftOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: Library - Desktop (always in DOM, animate width) */}
      <motion.div
        initial={false}
        animate={{ 
          width: isLeftOpen ? 280 : 0,
          opacity: isLeftOpen ? 1 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden lg:block flex-shrink-0 relative z-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1f]/95 via-[#130d24]/95 to-[#0f0a1f]/95 backdrop-blur-xl border-r border-violet-500/10" />
        <div className="relative w-[280px] h-full flex flex-col">
          <Sidebar isCollapsed={false} onToggle={() => setIsLeftOpen(false)} onClose={() => setIsLeftOpen(false)} />
        </div>
      </motion.div>

      {/* LEFT COLUMN: Library - Mobile (slide in from left) */}
      <AnimatePresence>
        {isLeftOpen && isMobile && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:hidden inset-y-0 left-0 w-[280px] z-40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1f] via-[#130d24] to-[#0f0a1f] backdrop-blur-xl border-r border-violet-500/10" />
            <div className="relative w-[280px] h-full flex flex-col">
              <Sidebar isCollapsed={false} onToggle={() => setIsLeftOpen(false)} onClose={() => setIsLeftOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER COLUMN: Oracle */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        {/* Left Toggle Button - Only visible when sidebar is closed */}
        <AnimatePresence>
          {!isLeftOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-4 left-4 z-50"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLeftOpen(true)}
                className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 backdrop-blur-xl border border-violet-400/30 rounded-xl text-white hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/30"
              >
                <PanelLeftOpen size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Toggle Button - Only visible when sidebar is closed */}
        <AnimatePresence>
          {!isRightOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 z-50"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRightOpen(true)}
                className="p-3 bg-gradient-to-r from-rose-600 to-pink-600 backdrop-blur-xl border border-rose-400/30 rounded-xl text-white hover:from-rose-500 hover:to-pink-500 transition-all shadow-lg shadow-rose-500/30"
              >
                <PanelRightOpen size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInterface />
      </main>

      {/* Mobile Overlay for Right Sidebar */}
      <AnimatePresence>
        {isRightOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsRightOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* RIGHT COLUMN: Chart - Desktop (always in DOM, animate width) */}
      <motion.div
        initial={false}
        animate={{ 
          width: isRightOpen ? 350 : 0,
          opacity: isRightOpen ? 1 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden lg:block flex-shrink-0 relative z-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1f]/95 via-[#130d24]/95 to-[#0f0a1f]/95 backdrop-blur-xl border-l border-violet-500/10" />
        <div className="relative w-[350px] h-full flex flex-col">
          {/* Close button for desktop right sidebar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRightOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-rose-500/20 text-rose-300 hover:text-white hover:bg-rose-500/40 rounded-lg transition-all border border-rose-400/30"
          >
            <X size={18} />
          </motion.button>
          <VisualChart />
        </div>
      </motion.div>

      {/* RIGHT COLUMN: Chart - Mobile (slide in from right) */}
      <AnimatePresence>
        {isRightOpen && isMobile && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:hidden inset-y-0 right-0 w-[350px] z-40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1f] via-[#130d24] to-[#0f0a1f] backdrop-blur-xl border-l border-violet-500/10" />
            <div className="relative w-[350px] h-full flex flex-col">
              <VisualChart />
            </div>

            {/* Mobile Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRightOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-rose-500/20 text-rose-300 hover:text-white hover:bg-rose-500/40 rounded-lg transition-all border border-rose-400/30"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
