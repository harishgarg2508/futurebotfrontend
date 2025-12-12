import type React from "react"
import type { RahuKaal } from "@/types/panchang"

interface RahuKaalWidgetProps {
  data: RahuKaal
}

const RahuKaalWidget: React.FC<RahuKaalWidgetProps> = ({ data }) => {
  return (
    <div className="mx-4 mt-6 p-4 rounded-xl cosmic-glass border border-red-500/20 relative overflow-hidden">
      {/* Subtle danger glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full cosmic-glass border border-red-500/30 flex items-center justify-center animate-cosmic-pulse">
            <span className="text-lg filter drop-shadow-lg">🛑</span>
          </div>
          <div>
            <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider">Rahu Kaal</h4>
            <p className="text-xs text-red-300/40">Avoid Auspicious Work</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-red-200 font-mono tracking-wide">
            {data.start} - {data.end}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RahuKaalWidget
