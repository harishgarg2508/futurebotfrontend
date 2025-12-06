"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Download } from "lucide-react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-6 md:w-96"
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#0d0d1a]/90 backdrop-blur-xl border border-violet-500/20 shadow-2xl p-5">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white tracking-wide">Install FutureBot</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Adds the app to your home screen for quick access to celestial wisdom.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative z-10 mt-5 flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 bg-white text-indigo-950 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-white/5 text-slate-300 border border-white/10 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
