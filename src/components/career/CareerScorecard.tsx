"use client"

import type React from "react"
import { motion } from "framer-motion"
import type { CareerPredictionResult } from "@/redux/slices/careerSlice"

interface CareerScorecardProps {
  data: CareerPredictionResult
}

const CareerScorecard: React.FC<CareerScorecardProps> = ({ data }) => {
  const topCareers = data.career_matrix.slice(0, 3)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topCareers.map((career, index) => (
          <motion.div
            key={career.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
              index === 0
                ? "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-400/30"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            {index === 0 && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                TOP MATCH
              </div>
            )}

            <h3 className="text-lg font-semibold text-violet-100 mb-3 mt-2">{career.category.replace(/_/g, " ")}</h3>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {career.score}
              </span>
              <span className="text-sm text-violet-400/60 mb-1.5 font-medium">% Match</span>
            </div>

            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${career.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CareerScorecard
