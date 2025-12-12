"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface BenefitDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  data: any // The benefit object
  type: "Hora" | "Chaughadiya"
  name: string
}

const BenefitDetailsModal: React.FC<BenefitDetailsModalProps> = ({ isOpen, onClose, data, type, name }) => {
  if (!data) return null

  // Helper for colors
  const getHeaderColor = () => {
     if (type === "Hora") {
         const c = data.color
         if (c === "gold") return "from-yellow-500/80 to-amber-700/80"
         if (c === "red") return "from-red-600/80 to-rose-800/80"
         if (c === "green") return "from-emerald-600/80 to-teal-800/80"
         if (c === "purple") return "from-purple-600/80 to-indigo-800/80"
         if (c === "orange") return "from-orange-500/80 to-red-600/80"
         if (c === "black") return "from-slate-700/80 to-slate-900/80"
         return "from-slate-500/80 to-slate-700/80"
     }
     // Chaughadiya
     const c = data.color
     if (c === "green") return "from-emerald-600/80 to-teal-800/80"
     if (c === "red") return "from-red-600/80 to-rose-800/80"
     if (c === "orange") return "from-orange-500/80 to-red-600/80"
     return "from-slate-600/80 to-slate-800/80"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-[#0a0a1a] rounded-t-3xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 bg-gradient-to-br ${getHeaderColor()} relative`}>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                             <div className="px-2 py-0.5 rounded bg-black/30 border border-white/20 text-[10px] uppercase tracking-widest text-white/80">
                                {type} Guide
                             </div>
                             <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-1">{name}</h2>
                        <h3 className="text-lg text-white/90 font-medium opacity-90">{data.title}</h3>
                        
                        <div className="mt-4 inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white backdrop-blur-md">
                            {data.modern_tag}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    
                    {/* Modern Advice */}
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <h4 className="text-xs uppercase tracking-widest text-violet-300 mb-2">Cosmic Advice</h4>
                        <p className="text-white/90 italic leading-relaxed">
                            "{data.modern_advice}"
                        </p>
                    </div>

                    {/* Checklists */}
                    <div className="grid grid-cols-1 gap-4">
                        {data.good_for && (
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Good For
                                </h4>
                                <ul className="space-y-2">
                                    {data.good_for.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {data.avoid && (
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    Avoid
                                </h4>
                                <ul className="space-y-2">
                                    {data.avoid.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                           <span className="text-red-500 mt-0.5">✕</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BenefitDetailsModal
