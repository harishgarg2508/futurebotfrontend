import React, { useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

// Planet icons/symbols for visual appeal
const planetSymbols: Record<string, { symbol: string; color: string }> = {
  Sun: { symbol: "☉", color: "#FFD700" },
  Moon: { symbol: "☽", color: "#E8E8E8" },
  Mars: { symbol: "♂", color: "#FF6B6B" },
  Mercury: { symbol: "☿", color: "#90EE90" },
  Jupiter: { symbol: "♃", color: "#FFB347" },
  Venus: { symbol: "♀", color: "#FF69B4" },
  Saturn: { symbol: "♄", color: "#8B8BB0" },
  Rahu: { symbol: "☊", color: "#6B5B95" },
  Ketu: { symbol: "☋", color: "#708090" },
}

export const PlanetarySummary: React.FC = () => {
  const { currentChartData } = useAppStore()

  if (!currentChartData) return null

  const { planets } = currentChartData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/80 via-violet-950/60 to-slate-900/80 backdrop-blur-xl border border-violet-400/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]"
    >
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-violet-500/10 via-rose-500/10 to-amber-500/10 border-b border-violet-400/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-rose-400 animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-300/80">
          Planetary Positions {Object.keys(planets).length > 0 && "(Click for details)"}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-violet-400/10">
        {Object.entries(planets).map(([planet, data]: [string, any], index) => (
          <PlanetRow key={planet} planet={planet} data={data} index={index} />
        ))}
      </div>
    </motion.div>
  )
}

const PlanetRow = ({ planet, data, index }: { planet: string; data: any; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const planetInfo = planetSymbols[planet] || { symbol: "●", color: "#C4B5FD" }

  return (
    <div className="flex flex-col transition-colors hover:bg-violet-500/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 w-full text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="text-lg w-6 text-center"
            style={{ color: planetInfo.color, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.2))" }}
          >
            {planetInfo.symbol}
          </span>
          <div>
            <div className="text-sm font-medium text-slate-200">{planet}</div>
            <div className="text-[10px] text-slate-400/80">{data.sign}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right">
              <div className="text-sm font-mono text-amber-200/70">
                {(() => {
                  const deg = data.degree ?? data.normDegree ?? 0;
                  return typeof deg === "number" ? deg.toFixed(2) : "0.00";
                })()}°
              </div>
              {data.isRetrograde || data.is_retrograde ? (
                  <div className="text-[10px] text-rose-400">Retrograde</div>
              ) : null}
           </div>
           <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
           />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-violet-950/20"
          >
            <div className="p-3 pt-0 grid grid-cols-2 gap-2 text-xs">
                 <div className="p-2 rounded bg-slate-900/30 border border-violet-500/10">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Nakshatra</span>
                    <span className="text-slate-300 font-medium">{data.nakshatra || "-"}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/30 border border-violet-500/10">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Lord</span>
                    <span className="text-slate-300 font-medium">{data.nakshatra_lord || "-"}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/30 border border-violet-500/10">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Pada</span>
                    <span className="text-slate-300 font-medium">{data.pada || "-"}</span>
                </div>
                 <div className="p-2 rounded bg-slate-900/30 border border-violet-500/10">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Dignity</span>
                    <span className={`font-medium ${
                        data.dignity === 'Exalted' ? 'text-emerald-400' : 
                        data.dignity === 'Debilitated' ? 'text-rose-400' : 
                        'text-slate-300'
                    }`}>{data.dignity || "Neutral"}</span>
                </div>
                <div className="col-span-2 p-2 rounded bg-slate-900/30 border border-violet-500/10 flex justify-between">
                    <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Longitude</span>
                        <span className="text-slate-300 font-mono">{data.longitude?.toFixed(4)}°</span>
                    </div>
                     {data.speed !== undefined && (
                        <div className="text-right">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Speed</span>
                            <span className="text-slate-300 font-mono">{data.speed?.toFixed(4)}°/day</span>
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
