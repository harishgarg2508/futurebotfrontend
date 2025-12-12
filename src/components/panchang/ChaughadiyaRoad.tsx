import { useState, useRef, useEffect } from "react"
import type { ChaughadiyaRoadmap, HoraSlot } from "@/types/panchang"
import { motion, AnimatePresence } from "framer-motion"

interface ChaughadiyaRoadProps {
  data: ChaughadiyaRoadmap
  horaData?: HoraSlot[]
  onItemClick?: (type: "Hora" | "Chaughadiya", name: string) => void
}

const ChaughadiyaRoad: React.FC<ChaughadiyaRoadProps> = ({ data, horaData, onItemClick }) => {
  const [showRoad, setShowRoad] = useState(false)
  const [activeTab, setActiveTab] = useState<"Chaughadiya" | "Hora">("Chaughadiya")
  const activeSlotRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to active slot when modal opens
  useEffect(() => {
    if (showRoad && activeSlotRef.current) {
      setTimeout(() => {
        activeSlotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 300) 
    }
  }, [showRoad, activeTab])

  // Flatten slots for Chaughadiya
  const chopsHelper = [...data.day, ...data.night].map(s => ({...s, isHora: false}))
  
  // Prepare Hora slots
  const horaHelper = horaData ? horaData.map(h => ({
      name: h.planet,
      type: h.type, // Map "Best" to "Good" etc or keep as is? Hora types: Energetic, Good, Fierce... 
      meaning: h.meaning,
      start_time: h.start_time,
      end_time: h.end_time,
      is_night: h.is_night,
      // determine active? We need to calculate it or if passed from outside. 
      // Current implementation passes 'is_active' in Chaughadiya but not Hora in backend response.
      // We'll calculate active roughly based on time or just highlight none if not passed.
      // Actually finding active hora is same logic as in Page.
      is_active: false, // Will calculate below
      isHora: true,
      color: h.color
  })) : []

  // Calculate active hora if needed
  if (horaHelper.length > 0) {
      // Simplistic check: If Chaughadiya current is known, we can guess time? 
      // No, let's use system time or first active logic.
      // Ideally parent passes active index or we calculate.
      // Let's reuse the logic:
      const now = new Date();
      const currentHHMM = now.toLocaleTimeString("en-US", {hour12: false, hour: '2-digit', minute:'2-digit'});
      // This matches system time.
      for(let h of horaHelper) {
          if(h.start_time > h.end_time) {
              if (currentHHMM >= h.start_time || currentHHMM < h.end_time) h.is_active = true;
          } else {
              if (currentHHMM >= h.start_time && currentHHMM < h.end_time) h.is_active = true;
          }
           // Only mark one
          if(h.is_active) break; 
      }
  }

  const currentList = activeTab === "Chaughadiya" ? chopsHelper : horaHelper
  const activeIndex = currentList.findIndex(slot => slot.is_active)

  return (
    <div className="px-4 pb-8">
      {/* 1. The Dock (Always Visible) - Triggers Roadmap */}
      <motion.div
        onClick={() => setShowRoad(true)}
        className="relative h-16 md:h-18 cosmic-glass rounded-full flex items-center px-2 cursor-pointer overflow-hidden animate-border-glow"
        whileTap={{ scale: 0.98 }}
      >
        {data.current ? (
          <>
            {/* Progress Glow Background */}
            <div className={`absolute left-0 top-0 bottom-0 w-1/3 opacity-30 blur-sm ${getGlowColor(data.current.type)}`} />

            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cosmic-glass ${getIconBorder(data.current.type)}`}>
              <span className="text-xl filter drop-shadow-lg">
                {data.current.type === "Good" ? "🚀" : data.current.type === "Bad" ? "⚠️" : "🚶"}
              </span>
            </div>

            {/* Text */}
            <div className="ml-4 flex-1">
              <div className="text-white font-bold tracking-wide">{data.current.name}</div>
              <div className="text-xs text-violet-300/60">Ends {data.current.end_time} • Tap for roadmap</div>
            </div>

            <div className="mr-4 text-violet-400/60 animate-cosmic-pulse">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </>
        ) : (
          <div className="p-4 text-violet-300/50 text-sm">Loading Timeline...</div>
        )}
      </motion.div>

      {/* 2. The Full Road (Overlay Modal) */}
      <AnimatePresence>
        {showRoad && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-end md:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRoad(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-[85vh] cosmic-glass-intense rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Tabs */}
              <div className="flex flex-col border-b border-violet-500/10 bg-gradient-to-b from-violet-900/20 to-transparent sticky top-0 z-20 backdrop-blur-md">
                   <div className="p-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white tracking-wide">Daily Roadmap</h3>
                        <button onClick={() => setShowRoad(false)} className="w-8 h-8 rounded-full cosmic-glass flex items-center justify-center text-violet-300/60 hover:text-white">✕</button>
                   </div>
                   
                   {/* Tabs */}
                   <div className="flex px-4 pb-2 gap-4">
                       <button 
                         onClick={() => setActiveTab("Chaughadiya")}
                         className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'Chaughadiya' ? 'text-white' : 'text-white/40'}`}
                       >
                           Chaughadiya
                           {activeTab === 'Chaughadiya' && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
                       </button>
                       <button 
                         onClick={() => setActiveTab("Hora")}
                         className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'Hora' ? 'text-white' : 'text-white/40'}`}
                       >
                           Hora (Planetary)
                           {activeTab === 'Hora' && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
                       </button>
                   </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-0 relative cosmic-scrollbar">
                
                {/* Timeline Line */}
                <div className="absolute left-[43px] top-6 bottom-6 w-[2px] bg-violet-800/20 z-0" />
                
                {currentList.map((slot, idx) => {
                  const isPast = activeIndex !== -1 && idx < activeIndex
                  const isCurrent = slot.is_active
                  
                  return (
                    <div 
                        key={`${idx}`} 
                        className="relative pl-14 pb-8 last:pb-0 group"
                        ref={isCurrent ? activeSlotRef : null}
                        onClick={() => onItemClick && onItemClick(activeTab, slot.name)}
                    >
                        {/* Connecting Line */}
                        {idx < currentList.length - 1 && (
                             <div className={`absolute left-[43px] top-4 h-[calc(100%+32px)] w-[2px] z-0
                                ${isPast ? 'bg-gradient-to-b from-violet-500/50 to-violet-500/50' : 
                                  isCurrent ? 'bg-gradient-to-b from-violet-500/50 to-transparent' : 'bg-transparent'}
                             `} />
                        )}

                        {/* The Dot */}
                        <div
                            className={`absolute left-[36px] top-[14px] w-4 h-4 rounded-full border-[3px] z-10 transition-all duration-500
                                ${isCurrent 
                                    ? `border-white scale-125 shadow-[0_0_15px_currentColor] ${activeTab === 'Hora' ? getHoraDot(slot.color) : getSlotDotColor(slot.type)}` 
                                    : isPast 
                                        ? "border-violet-500/30 bg-violet-900/80" 
                                        : "border-violet-800/30 bg-[#0a0a1a]"
                                }
                            `}
                        >
                            {isCurrent && (
                                <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${activeTab === 'Hora' ? getHoraDot(slot.color) : getSlotDotColor(slot.type)}`} />
                            )}
                        </div>

                      {/* Card */}
                      <div className={`relative p-3 rounded-xl border transition-all duration-300 cursor-pointer
                            ${isCurrent 
                                ? "bg-violet-500/10 border-violet-500/40 shadow-lg translate-x-1" 
                                : isPast
                                    ? "bg-violet-900/5 border-violet-800/10 opacity-60 grayscale-[0.5]"
                                    : "bg-transparent border-transparent opacity-40 hover:opacity-80 border-dashed hover:border-solid hover:border-white/10"
                            }
                        `}
                      >
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold ${activeTab === 'Hora' ? getHoraText(slot.color) : (isCurrent ? 'text-white' : getSlotTextColor(slot.type))}`}>
                                    {slot.name}
                                </span>
                                {slot.is_night && (
                                  <span className="text-[9px] uppercase tracking-wider bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    Night
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-violet-300/50 leading-snug max-w-[200px]">{slot.meaning}</div>
                           </div>
                           
                           <div className="flex flex-col items-end shrink-0 gap-2">
                                <div className={`text-xs font-mono px-2 py-1 rounded bg-black/20 border border-white/5 ${isCurrent ? "text-amber-400" : "text-violet-400/50"}`}>
                                    {slot.start_time}
                                </div>
                                <button className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white/40 hover:bg-white/10 hover:text-white">
                                    ?
                                </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getGlowColor(type: string) {
  if (type === "Good") return "bg-emerald-500"
  if (type === "Bad") return "bg-red-500"
  return "bg-violet-500"
}

function getIconBorder(type: string) {
  if (type === "Good") return "border-emerald-500/30"
  if (type === "Bad") return "border-red-500/30"
  return "border-violet-500/30"
}

function getSlotDotColor(type: string) {
  if (type === "Good") return "bg-emerald-500 text-emerald-500"
  if (type === "Bad") return "bg-red-500 text-red-500"
  return "bg-amber-500 text-amber-500"
}

function getSlotTextColor(type: string) {
   if (type === "Good") return "text-emerald-400"
   if (type === "Bad") return "text-red-400"
   return "text-violet-300"
}

function getHoraDot(color?: string) {
    if(color === 'gold') return "bg-yellow-500 text-yellow-500";
    if(color === 'green') return "bg-emerald-500 text-emerald-500";
    if(color === 'red') return "bg-red-500 text-red-500";
    if(color === 'purple') return "bg-purple-500 text-purple-500";
    return "bg-slate-500 text-slate-500";
}

function getHoraText(color?: string) {
    if(color === 'gold') return "text-yellow-400";
    if(color === 'green') return "text-emerald-400";
    if(color === 'red') return "text-red-400";
    if(color === 'purple') return "text-purple-400";
    return "text-slate-300";
}

export default ChaughadiyaRoad
