"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Crown, Briefcase, Heart, Zap, Star, Shield, Search, Lightbulb, Anchor, Scale, Users } from "lucide-react"

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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "business": return <Briefcase size={20} />
      case "health": return <Heart size={20} />
      case "tech": return <Zap size={20} />
      case "creative": return <Star size={20} />
      case "finance": return <Scale size={20} />
      case "education": return <Lightbulb size={20} />
      case "legal": return <Shield size={20} />
      case "engineering": return <Anchor size={20} />
      case "research": return <Search size={20} />
      default: return <Users size={20} />
    }
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((item, index) => (
        <motion.div
          key={item.category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <div
            onClick={() => setExpandedCategory(expandedCategory === item.category ? null : item.category)}
            className={`
              relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
              ${
                expandedCategory === item.category
                  ? "bg-[var(--color-lavender)]/10 border-[var(--color-lavender)]/30 shadow-[0_0_20px_rgba(167,139,250,0.15)]"
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-[var(--color-lavender)]/20"
              }
              border backdrop-blur-sm
            `}
          >
            <div className="relative">
              {/* Progress Bar Background */}
              <div className="absolute inset-0 bg-[var(--color-deep)]/50 z-0"></div>
              
              {/* Animated Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                className="absolute top-0 left-0 bottom-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, var(--color-lavender), var(--color-violet))`,
                }}
              />

              <div className="relative z-10 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${expandedCategory === item.category ? "bg-[var(--color-lavender)]/20 text-[var(--color-light)]" : "bg-white/5 text-[var(--color-lavender)]/70"}`}>
                      {getIcon(item.category)}
                    </div>
                    <h4 className={`font-medium text-lg ${expandedCategory === item.category ? "text-[var(--color-light)]" : "text-[var(--color-light)]/80"}`}>
                      {item.category}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[var(--color-light)]">{item.score}%</span>
                    <ChevronDown
                      size={18}
                      className={`text-[var(--color-lavender)]/50 transition-transform duration-300 ${
                        expandedCategory === item.category ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Yogas Count Badge */}
                {item.yogas.length > 0 && (
                  <div className="flex items-center gap-2 mt-1 ml-12">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-lavender)]/10 text-[var(--color-lavender)] border border-[var(--color-lavender)]/20">
                        {item.yogas.length} Cosmic Alignments
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {expandedCategory === item.category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2 space-y-3 border-t border-[var(--color-lavender)]/10 mx-5 mt-2">
                    {item.yogas.length > 0 ? (
                      item.yogas.map((yoga, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-[var(--color-deep)]/60 rounded-xl p-3 border border-white/5 hover:border-[var(--color-lavender)]/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-[var(--color-light)]">{yoga.name}</span>
                                    {yoga.tier === "👑" && <Crown size={12} className="text-[var(--color-amber)]" fill="currentColor" />}
                                </div>
                                <p className="text-xs text-[var(--color-lavender)]/70 leading-relaxed">{yoga.desc}</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end">
                                <span className="text-xs font-bold text-[var(--color-lavender)]">+{yoga.points}</span>
                                <span className="text-[10px] text-[var(--color-lavender)]/40">pts</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[var(--color-lavender)]/40 text-sm italic">
                        No specific yogas found for this path.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default DestinyStack
