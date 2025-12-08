import React from "react"

interface NorthIndianChartProps {
  planets: Record<string, any>
  ascendantSignId: number
  munthaSignId?: number
  label?: string
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  planets,
  ascendantSignId,
  munthaSignId,
  label,
}) => {
  const planetColors: Record<string, string> = {
    Su: "#FFD700",
    Mo: "#E8E8E8",
    Ma: "#FF6B6B",
    Me: "#90EE90",
    Ju: "#FFB347",
    Ve: "#FF69B4",
    Sa: "#8B8BB0",
    Ra: "#6B5B95",
    Ke: "#708090",
  }

  const housePlanets: Record<number, string[]> = {}

  // Add Planets
  Object.entries(planets).forEach(([name, data]: [string, any]) => {
    const pSignId = data.sign_id
    if (!pSignId || !ascendantSignId) return
    const houseNum = ((pSignId - ascendantSignId + 12) % 12) + 1
    if (!housePlanets[houseNum]) housePlanets[houseNum] = []
    let lbl = name.substring(0, 2)
    if (data.is_retrograde) lbl += "ᴿ"
    housePlanets[houseNum].push(lbl)
  })

  // Add Muntha
  if (munthaSignId) {
    const houseNum = ((munthaSignId - ascendantSignId + 12) % 12) + 1
    if (!housePlanets[houseNum]) housePlanets[houseNum] = []
    housePlanets[houseNum].push("Mu") // Muntha Label
  }

  const renderPlanets = (houseNum: number, x: number, y: number) => {
    const list = housePlanets[houseNum] || []
    // Center the group vertically based on number of planets
    // Reduced spacing to 5 to fit more planets tightly
    const startY = y - ((list.length - 1) * 5) / 2

    return list.map((p, i) => {
      const base = p.replace("ᴿ", "")
      const isMuntha = p === "Mu"
      return (
        <text
          key={`${p}-${i}`}
          x={x}
          y={startY + i * 5}
          textAnchor="middle"
          dominantBaseline="middle"
          // Reduced font size to 5px (approx 3.5-4px visually in SVG scale) to ensure they stay inside
          className={`font-bold ${isMuntha ? "text-[5px] fill-rose-500" : "text-[5px]"}`}
          style={!isMuntha ? { fill: planetColors[base] || "#C4B5FD" } : {}}
        >
          {isMuntha ? "●" : p}
        </text>
      )
    })
  }

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-violet-950/70 to-slate-900/90 border border-violet-400/20 rounded-xl p-4 shadow-2xl shadow-violet-500/10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="chart-lines" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="url(#chart-lines)" strokeWidth="0.5" rx="2" />
          <line x1="2" y1="2" x2="98" y2="98" stroke="url(#chart-lines)" strokeWidth="0.5" />
          <line x1="98" y1="2" x2="2" y2="98" stroke="url(#chart-lines)" strokeWidth="0.5" />
          <line x1="50" y1="2" x2="2" y2="50" stroke="url(#chart-lines)" strokeWidth="0.5" />
          <line x1="2" y1="50" x2="50" y2="98" stroke="url(#chart-lines)" strokeWidth="0.5" />
          <line x1="50" y1="98" x2="98" y2="50" stroke="url(#chart-lines)" strokeWidth="0.5" />
          <line x1="98" y1="50" x2="50" y2="2" stroke="url(#chart-lines)" strokeWidth="0.5" />

          {/* House 1 (Top Diamond) */}
          {renderPlanets(1, 50, 25)}
          <text x="50" y="45" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 1 - 2) % 12) + 1}
          </text>

          {/* House 2 (Top Left) */}
          {renderPlanets(2, 25, 15)}
          <text x="25" y="5" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 2 - 2) % 12) + 1}
          </text>

          {/* House 3 (Left Top) */}
          {renderPlanets(3, 15, 25)}
          <text x="5" y="25" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 3 - 2) % 12) + 1}
          </text>

          {/* House 4 (Left Diamond) */}
          {renderPlanets(4, 25, 50)}
          <text x="25" y="50" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 4 - 2) % 12) + 1}
          </text>

          {/* House 5 (Left Bottom) */}
          {renderPlanets(5, 15, 75)}
          <text x="5" y="75" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 5 - 2) % 12) + 1}
          </text>

          {/* House 6 (Bottom Left) */}
          {renderPlanets(6, 25, 85)}
          <text x="25" y="95" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 6 - 2) % 12) + 1}
          </text>

          {/* House 7 (Bottom Diamond) */}
          {renderPlanets(7, 50, 75)}
          <text x="50" y="55" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 7 - 2) % 12) + 1}
          </text>

          {/* House 8 (Bottom Right) */}
          {renderPlanets(8, 75, 85)}
          <text x="75" y="95" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 8 - 2) % 12) + 1}
          </text>

          {/* House 9 (Right Bottom) */}
          {renderPlanets(9, 85, 75)}
          <text x="95" y="75" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 9 - 2) % 12) + 1}
          </text>

          {/* House 10 (Right Diamond) */}
          {renderPlanets(10, 75, 50)}
          <text x="75" y="50" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 10 - 2) % 12) + 1}
          </text>

          {/* House 11 (Right Top) */}
          {renderPlanets(11, 85, 25)}
          <text x="95" y="25" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 11 - 2) % 12) + 1}
          </text>

          {/* House 12 (Top Right) */}
          {renderPlanets(12, 75, 15)}
          <text x="75" y="5" textAnchor="middle" className="text-[4px] fill-slate-500/50">
            {((ascendantSignId + 12 - 2) % 12) + 1}
          </text>
        </svg>
      </div>
      {label && (
        <div className="absolute top-2 left-2 text-xs text-violet-300/50 font-medium uppercase tracking-wider">
          {label}
        </div>
      )}
      <div className="absolute -bottom-6 left-0 w-full text-center">
        <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <span className="text-rose-500 text-xs">●</span> represents Muntha Position
        </span>
      </div>
    </div>
  )
}
