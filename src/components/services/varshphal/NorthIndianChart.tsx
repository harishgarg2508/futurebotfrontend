import React from "react"
import { useTranslation } from "react-i18next"

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
  const { t, i18n } = useTranslation()
  
  const planetColors: Record<string, string> = {
    Sun: "#FFD700",
    Moon: "#E8E8E8",
    Mars: "#FF6B6B",
    Mercury: "#90EE90",
    Jupiter: "#FFB347",
    Venus: "#FF69B4",
    Saturn: "#8B8BB0",
    Rahu: "#6B5B95",
    Ketu: "#708090",
    // Short codes fallback
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
    
    // Translation Logic
    let baseName = name
    // If name is "Sun", "Moon", etc.
    let localizedName = t(`planets.${name}`, { defaultValue: name });
    
    // If English, take first 2 chars. If Hindi, keep full (usually 1-3 chars).
    let lbl = localizedName;
    if (i18n.language === 'en' && localizedName.length > 2 && name !== "Rahu" && name !== "Ketu") { // Rahu/Ketu usually kept? or Ra/Ke. Custom pref.
         lbl = localizedName.substring(0, 2)
    } else if (i18n.language === 'en') {
       lbl = localizedName.substring(0, 2)
    }
    
    if (data.is_retrograde) lbl += "ᴿ"
    
    // Store original name for color lookup if needed, or pass color.
    // We need to store object or string? Array is string[].
    // I need to know the base code for color mapping in renderPlanets.
    // I will append a hidden separator or just lookup by english name?
    // Hard to lookup by localized string.
    // I can change housePlanets to store objects: { label: string, colorKey: string }
    // But `housePlanets` is `Record<number, string[]>`. 
    // I will refactor `housePlanets` usage to `any[]` or keep it simple.
    // Keeping simple: I'll rely on `planetColors` having keys that might match? No.
    // I will modify `renderPlanets` to NOT rely on `p` for color lookup if `p` is localized.
    // Actually, `renderPlanets` does `const base = p.replace("ᴿ", "")`.
    // If `p` is "सूर्य", base is "सूर्य". `planetColors["सूर्य"]` is undefined.
    // So I must fix color lookup.
    
    // Better strategy: Store tuples `[label, colorKey]` in the array?
    // Or just store the localized label, and we accept default color if lookup fails?
    // Or map Hindi names back to colors?
    // Added Hindi names to PlanetColors? tedious.
    
    // Let's change `housePlanets` to store `{ label: string, key: string }`.
    
    // Wait, refactoring `housePlanets` type is better.
    housePlanets[houseNum].push(JSON.stringify({ label: lbl, key: name })) 
  })

  // Add Muntha
  if (munthaSignId) {
    const houseNum = ((munthaSignId - ascendantSignId + 12) % 12) + 1
    if (!housePlanets[houseNum]) housePlanets[houseNum] = []
    housePlanets[houseNum].push(JSON.stringify({ label: "Mu", key: "Muntha" })) 
  }

  const renderPlanets = (houseNum: number, x: number, y: number) => {
    const list = housePlanets[houseNum] || []
    const startY = y - ((list.length - 1) * 5) / 2

    return list.map((itemStr, i) => {
      const item = JSON.parse(itemStr)
      const { label, key } = item
      const isMuntha = key === "Muntha"
      
      return (
        <text
          key={`${key}-${i}`}
          x={x}
          y={startY + i * 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-bold ${isMuntha ? "text-[5px] fill-rose-500" : "text-[5px]"}`}
          style={!isMuntha ? { fill: planetColors[key] || "#C4B5FD" } : {}}
        >
          {isMuntha ? "●" : label}
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
          <text x="50" y="40" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 1 - 2) % 12) + 1}
          </text>

          {/* House 2 (Top Left) */}
          {renderPlanets(2, 25, 15)}
          <text x="25" y="5" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 2 - 2) % 12) + 1}
          </text>

          {/* House 3 (Left Top) */}
          {renderPlanets(3, 15, 25)}
          <text x="5" y="25" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 3 - 2) % 12) + 1}
          </text>

          {/* House 4 (Left Diamond) - Fixed Overlap (Moved to Outer Edge) */}
          {renderPlanets(4, 25, 50)}
          <text x="12" y="50" textAnchor="middle" dominantBaseline="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 4 - 2) % 12) + 1}
          </text>

          {/* House 5 (Left Bottom) */}
          {renderPlanets(5, 15, 75)}
          <text x="5" y="75" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 5 - 2) % 12) + 1}
          </text>

          {/* House 6 (Bottom Left) */}
          {renderPlanets(6, 25, 85)}
          <text x="25" y="95" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 6 - 2) % 12) + 1}
          </text>

          {/* House 7 (Bottom Diamond) */}
          {renderPlanets(7, 50, 75)}
          <text x="50" y="60" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 7 - 2) % 12) + 1}
          </text>

          {/* House 8 (Bottom Right) */}
          {renderPlanets(8, 75, 85)}
          <text x="75" y="95" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 8 - 2) % 12) + 1}
          </text>

          {/* House 9 (Right Bottom) */}
          {renderPlanets(9, 85, 75)}
          <text x="95" y="75" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 9 - 2) % 12) + 1}
          </text>

          {/* House 10 (Right Diamond) - Fixed Overlap (Moved to Outer Edge) */}
          {renderPlanets(10, 75, 50)}
          <text x="88" y="50" textAnchor="middle" dominantBaseline="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 10 - 2) % 12) + 1}
          </text>

          {/* House 11 (Right Top) */}
          {renderPlanets(11, 85, 25)}
          <text x="95" y="25" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 11 - 2) % 12) + 1}
          </text>

          {/* House 12 (Top Right) */}
          {renderPlanets(12, 75, 15)}
          <text x="75" y="5" textAnchor="middle" className="text-[4px] font-bold" fill="#FFD700">
            {((ascendantSignId + 12 - 2) % 12) + 1}
          </text>
        </svg>
      </div>
      {label && (
        <div className="absolute top-2 left-2 text-xs text-violet-300/50 font-medium uppercase tracking-wider">
          {label}
        </div>
      )}
      {munthaSignId && (
        <div className="absolute -bottom-6 left-0 w-full text-center">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span className="text-rose-500 text-xs">●</span> represents Muntha Position
            </span>
        </div>
      )}
    </div>
  )
}
