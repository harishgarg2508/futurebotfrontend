"use client"

import type React from "react"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

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
          Planetary Positions
        </span>
      </div>

      {/* Table */}
      <div className="p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold">
                Planet
              </th>
              <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold">
                Sign
              </th>
              <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-violet-300/60 font-semibold text-right">
                Degree
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-400/10">
            {Object.entries(planets).map(([planet, data]: [string, any], index) => {
              const planetInfo = planetSymbols[planet] || { symbol: "●", color: "#C4B5FD" }
              return (
                <motion.tr
                  key={planet}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-violet-500/5 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-lg transition-transform group-hover:scale-110"
                        style={{ color: planetInfo.color, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.2))" }}
                      >
                        {planetInfo.symbol}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{planet}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300/80">{data.sign}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono text-amber-200/70">
                    {(() => {
                      const deg = data.longitude ?? data.fullDegree ?? data.degree ?? data.normDegree ?? 0;
                      return typeof deg === "number" ? deg.toFixed(2) : "0.00";
                    })()}°
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
