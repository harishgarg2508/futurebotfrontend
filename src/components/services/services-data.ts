// Service configuration - easily add new services here
export interface ServiceConfig {
  id: string
  name: string
  description: string
  icon: string // Using planet/celestial symbols
  color: string
  gradient: string
  href?: string // For page navigation
  component?: string // For component-based rendering
}

export const ASTROLOGY_SERVICES: ServiceConfig[] = [
  {
    id: "kundli",
    name: "Kundli",
    description: "Birth Chart Analysis",
    icon: "☉",
    color: "#F59E0B",
    gradient: "from-amber-400 to-orange-500",
    href: "/oracle/kundli",
  },
  {
    id: "varshfala",
    name: "Varshfala",
    description: "Annual Predictions",
    icon: "☽",
    color: "#A78BFA",
    gradient: "from-violet-400 to-purple-500",
    href: "/oracle/varshfala",
  },
  {
    id: "kundli-matching",
    name: "Kundli Matching",
    description: "Compatibility Analysis",
    icon: "♀",
    color: "#F472B6",
    gradient: "from-pink-400 to-rose-500",
    href: "/kundli-matching",
  },
  {
    id: "gochar",
    name: "Gochar",
    description: "Transit Predictions",
    icon: "♄",
    color: "#60A5FA",
    gradient: "from-blue-400 to-indigo-500",
    href: "/oracle/gochar",
  },
  {
    id: "panchang",
    name: "Panchang",
    description: "Today's Almanac",
    icon: "☿",
    color: "#34D399",
    gradient: "from-emerald-400 to-teal-500",
    href: "/oracle/panchang",
  },
  {
    id: "dasha",
    name: "Dasha",
    description: "Planetary Periods",
    icon: "♃",
    color: "#FBBF24",
    gradient: "from-yellow-400 to-amber-500",
    href: "/oracle/dasha",
  },
  {
    id: "muhurta",
    name: "Muhurta",
    description: "Auspicious Timing",
    icon: "⚹",
    color: "#818CF8",
    gradient: "from-indigo-400 to-violet-500",
    href: "/oracle/muhurta",
  },
  {
    id: "remedies",
    name: "Remedies",
    description: "Astrological Solutions",
    icon: "♂",
    color: "#FB7185",
    gradient: "from-rose-400 to-red-500",
    href: "/oracle/remedies",
  },
  {
    id: "ask-question",
    name: "Ask Question",
    description: "AI Astrologer",
    icon: "✧",
    color: "#C4B5FD",
    gradient: "from-purple-300 to-violet-400",
    href: "/oracle/ask",
  },
  {
    id: "varga",
    name: "Varga Charts",
    description: "16 Divisional Charts",
    icon: "☸",
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-600",
    href: "/oracle/varga",
  },
  {
    id: "career",
    name: "Career",
    description: "Titan Career Engine",
    icon: "⚡",
    color: "#10B981",
    gradient: "from-emerald-500 to-teal-600",
    href: "/career",
  },
]
