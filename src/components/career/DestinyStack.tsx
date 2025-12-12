"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Rocket, Crown } from "lucide-react"

interface Yoga {
  name: string
  desc: string
  points: number
  tier: string
}

interface CareerCategory {
  category: string
  score: number
  color: string
  yogas: Yoga[]
}

interface DestinyStackProps {
  data: CareerCategory[]
}

const DestinyStack: React.FC<DestinyStackProps> = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "gold":
        return "from-amber-400 to-yellow-500"
      case "blue":
        return "from-cyan-400 to-blue-500"
      case "red":
        return "from-rose-400 to-pink-500"
      default:
        return "from-violet-400 to-fuchsia-500"
    }
  }

  const getTextColor = (color: string) => {
    switch (color) {
      case "gold":
        return "text-amber-400"
      case "blue":
        return "text-cyan-400"
      case "red":
        return "text-rose-400"
      default:
        return "text-violet-400"
    }
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const isExpanded = expandedIndex === index
        const isWinner = index === 0

        return (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl overflow-hidden transition-all duration-300"
          >
            <div
              className={`relative bg-white/5 backdrop-blur-sm border transition-all duration-300 rounded-2xl ${
                isExpanded ? "border-white/20 shadow-lg" : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Main Bar */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full relative h-20 flex items-center px-6 z-10 group"
              >
                {/* Progress Background */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                  className={`absolute top-0 left-0 h-full opacity-10 bg-gradient-to-r ${getColorClasses(item.color)} rounded-2xl`}
                />

                {/* Rank/Icon */}
                <div className="mr-5 flex-shrink-0 w-10">
                  {isWinner ? (
                    <div className="relative">
                      <Crown className="text-amber-400 mx-auto drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={24} />
                    </div>
                  ) : (
                    <span className="text-violet-400/40 font-bold text-lg">#{index + 1}</span>
                  )}
                </div>

                {/* Category Name */}
                <div className="flex-1 text-left">
                  <h4
                    className={`font-bold text-lg transition-colors ${
                      isWinner ? "text-white" : "text-violet-200/80 group-hover:text-white"
                    }`}
                  >
                    {item.category}
                  </h4>
                </div>

                {/* Score & Chevron */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className={`text-3xl font-black font-mono ${getTextColor(item.color)}`}>{item.score}</span>
                    <span className="text-violet-400/50 text-sm ml-1">%</span>
                  </div>
                  <ChevronDown
                    className={`text-violet-400/50 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    size={22}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-white/5">
                      <div className="mt-4 mb-3 flex items-center gap-2">
                        <Rocket size={14} className="text-violet-400" />
                        <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                          Planetary Evidence
                        </span>
                      </div>

                      {item.yogas.length > 0 ? (
                        <div className="grid gap-3">
                          {item.yogas.map((yoga, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={`p-4 rounded-xl border backdrop-blur-sm flex items-start gap-3 transition-all hover:scale-[1.02] ${
                                yoga.tier === "👑"
                                  ? "bg-amber-500/5 border-amber-400/20 hover:border-amber-400/40"
                                  : "bg-white/5 border-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="text-3xl flex-shrink-0">{yoga.tier}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-3 mb-2">
                                  <h5
                                    className={`font-bold text-sm leading-tight ${
                                      yoga.tier === "👑" ? "text-amber-200" : "text-violet-200"
                                    }`}
                                  >
                                    {yoga.name}
                                  </h5>
                                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-white/80 flex-shrink-0 border border-white/10">
                                    +{yoga.points}
                                  </span>
                                </div>
                                <p className="text-xs text-violet-300/60 leading-relaxed">{yoga.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-violet-400/40 text-sm italic py-3 px-4 bg-white/5 rounded-lg border border-white/5">
                          General planetary strength supports this path
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default DestinyStack
