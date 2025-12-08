"use client"

import type React from "react"
import { motion } from "framer-motion"

interface Planet {
  name: string
  sign: string
  house: number
  isRetrograde?: boolean
}

interface NorthIndianChartProps {
  planets: Record<string, Planet>
  ascendantSignId: number
  className?: string
}

// Planet colors for visual distinction
const planetColors: Record<string, string> = {
  Su: "#FFD700", // Gold - Sun
  Mo: "#E8E8E8", // Silver - Moon
  Ma: "#FF6B6B", // Red - Mars
  Me: "#90EE90", // Green - Mercury
  Ju: "#FFB347", // Orange - Jupiter
  Ve: "#FF69B4", // Pink - Venus
  Sa: "#8B8BB0", // Indigo - Saturn
  Ra: "#6B5B95", // Purple - Rahu
  Ke: "#708090", // Slate - Ketu
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ planets, ascendantSignId, className = "" }) => {
  const housePlanets: Record<number, string[]> = {}

  Object.entries(planets).forEach(([name, data]: [string, any]) => {
    const pSignId = data.sign_id
    if (!pSignId || !ascendantSignId) return
    const houseNum = ((pSignId - ascendantSignId + 12) % 12) + 1
    if (!housePlanets[houseNum]) housePlanets[houseNum] = []
    let label = name.substring(0, 2)
    if (data.isRetrograde || data.is_retrograde) label += "(R)"
    housePlanets[houseNum].push(label)
  })

  const renderPlanets = (houseNum: number, x: number, y: number) => {
    const list = housePlanets[houseNum] || []
    return (
      <g>
        {list.map((p, i) => {
          const baseLabel = p.replace("(R)", "")
          const isRetro = p.includes("(R)")
          const color = planetColors[baseLabel] || "#E0D4F7"
          return (
            <g key={p}>
              <text
                x={x}
                y={y + i * 18}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[20px] font-bold"
                style={{ fill: color, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))" }}
              >
                {baseLabel}
                {isRetro && (
                  <tspan className="text-[10px] fill-rose-300" dx="1">
                    R
                  </tspan>
                )}
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative w-full aspect-square ${className}`}
    >
      {/* Ambient glow behind chart */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-rose-500/10 rounded-2xl blur-xl" />

      {/* Main chart container */}
      <div className="relative w-full h-full p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 via-violet-950/80 to-slate-900/90 backdrop-blur-xl border border-violet-400/20 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
        {/* Decorative corner stars */}
        <div className="absolute top-3 left-3 w-2 h-2 bg-amber-300/60 rounded-full animate-pulse" />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-violet-300/60 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-rose-300/60 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-3 right-3 w-2 h-2 bg-amber-300/60 rounded-full animate-pulse delay-700" />

        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="chartLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#F9A8D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="houseHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Frame with glow */}
          <rect
            x="4"
            y="4"
            width="392"
            height="392"
            fill="none"
            stroke="url(#chartLineGradient)"
            strokeWidth="2"
            rx="8"
            filter="url(#glow)"
          />

          {/* Inner subtle fill */}
          <rect x="4" y="4" width="392" height="392" fill="url(#houseHighlight)" rx="8" />

          {/* Diagonals (X) */}
          <line x1="4" y1="4" x2="396" y2="396" stroke="url(#chartLineGradient)" strokeWidth="1.5" />
          <line x1="396" y1="4" x2="4" y2="396" stroke="url(#chartLineGradient)" strokeWidth="1.5" />

          {/* Inner Diamond */}
          <line x1="200" y1="4" x2="4" y2="200" stroke="url(#chartLineGradient)" strokeWidth="1.5" />
          <line x1="4" y1="200" x2="200" y2="396" stroke="url(#chartLineGradient)" strokeWidth="1.5" />
          <line x1="200" y1="396" x2="396" y2="200" stroke="url(#chartLineGradient)" strokeWidth="1.5" />
          <line x1="396" y1="200" x2="200" y2="4" stroke="url(#chartLineGradient)" strokeWidth="1.5" />

          {/* House Labels (Planets) */}
          <g>
            {renderPlanets(1, 200, 80)}
            {renderPlanets(2, 100, 45)}
            {renderPlanets(3, 45, 100)}
            {renderPlanets(4, 100, 200)}
            {renderPlanets(5, 45, 300)}
            {renderPlanets(6, 100, 355)}
            {renderPlanets(7, 200, 320)}
            {renderPlanets(8, 300, 355)}
            {renderPlanets(9, 355, 300)}
            {renderPlanets(10, 300, 200)}
            {renderPlanets(11, 355, 100)}
            {renderPlanets(12, 300, 45)}
          </g>

          {/* House Numbers - Soft and subtle */}
          {/* House Numbers - Dynamic Sign Numbers */}
          <g className="font-light" style={{ fill: "rgba(196, 181, 253, 0.4)" }}>
            {[
              { house: 1, x: 200, y: 145 },
              { house: 2, x: 55, y: 55 },
              { house: 3, x: 55, y: 200 },
              { house: 4, x: 145, y: 200 },
              { house: 5, x: 55, y: 345 },
              { house: 6, x: 145, y: 345 },
              { house: 7, x: 200, y: 260 },
              { house: 8, x: 345, y: 345 },
              { house: 9, x: 255, y: 345 },
              { house: 10, x: 255, y: 200 },
              { house: 11, x: 345, y: 200 },
              { house: 12, x: 345, y: 55 },
            ].map(({ house, x, y }) => {
              // Calculate Sign Number relative to Ascendant
              // House 1 has Ascendant Sign
              // Sign = ((Ascendant + House - 1) - 1) % 12 + 1
              // Simplified: (Ascendant + House - 2) % 12 + 1
              // Note: ascendantSignId is 1-based (Aries=1)
              const signNum = ((ascendantSignId + house - 2) % 12) + 1;
              return (
                <text key={house} x={x} y={y} className="text-[9px]" textAnchor="middle">
                  {signNum}
                </text>
              )
            })}
          </g>

          {/* Center decoration */}
          <circle cx="200" cy="200" r="3" fill="#FDE68A" opacity="0.6" />
        </svg>
      </div>
    </motion.div>
  )
}
