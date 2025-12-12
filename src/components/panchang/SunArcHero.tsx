"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { HeroSunArc, CoreData, ChaughadiyaSlot, HoraSlot } from "@/types/panchang"
import { motion } from "framer-motion"

interface SunArcHeroProps {
  heroData: HeroSunArc
  coreData: CoreData
  currentChaughadiya: ChaughadiyaSlot | null
  currentHora?: HoraSlot
  displayDate: string
  onChaughadiyaClick?: (name: string) => void
  onHoraClick?: (name: string) => void
}

const SunArcHero: React.FC<SunArcHeroProps> = ({ heroData, coreData, currentChaughadiya, currentHora, displayDate, onChaughadiyaClick, onHoraClick }) => {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isNight, setIsNight] = useState(false)

  // -- Clock & Night Detection --
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      )

      // Night Detection Logic
      // Parse Sunrise/Sunset times from string (HH:MM AM/PM) to Date objects for today
      // Format is typically "06:45 AM"
      if (heroData?.sunrise && heroData?.sunset) {
        const parseTime = (timeStr: string) => {
           const [time, modifier] = timeStr.split(" ")
           let [hours, minutes] = time.split(":").map(Number)
           if (modifier === "PM" && hours < 12) hours += 12
           if (modifier === "AM" && hours === 12) hours = 0
           const d = new Date()
           d.setHours(hours, minutes, 0)
           return d
        }

        const sunriseTime = parseTime(heroData.sunrise)
        const sunsetTime = parseTime(heroData.sunset)
        
        // If now is before sunrise OR after sunset => Night
        // Note: This simple logic assumes sunrise/sunset are for the current day.
        if (now < sunriseTime || now > sunsetTime) {
            setIsNight(true)
        } else {
            setIsNight(false)
        }
      }
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [heroData])

  // --- Moon Logic Helpers ---
  const getTithiPercent = () => {
       // Estimate phase based on Tithi Name and Paksha
       const tithiName = coreData.tithi.name.toLowerCase();
       const paksha = coreData.tithi.paksha?.toLowerCase() || "shukla";
       
       const tithis = [
           "pratipada", "dwitiya", "tritiya", "chaturthi", "panchami", 
           "shashthi", "saptami", "ashtami", "navami", "dashami", 
           "ekadashi", "dwadashi", "trayodashi", "chaturdashi", "purnima", "amavasya"
       ];
       
       let index = tithis.findIndex(t => tithiName.includes(t));
       if (index === -1) {
           // Fallback: If "Krishna" and "Shukla" valid, guess based on that?
           // Or search looser matches?
           index = 7; 
       }
       
       // Calculate Illumination (0 to 1)
       // Linear approx: (index+1)/15
       const day = index + 1;
       let pct = day / 15;
       
       const isWaxing = paksha.includes("shukla");
       
       // If Krishna (Waning), illumination decreases from Full (15) to New (30) 
       // but here we are using 0-15 scale for both.
       // Actually Tithi Index 1-15 is for *that* paksha.
       // Shukla 1 = 1/15th lit. Shukla 15 = Full.
       // Krishna 1 = 14/15th lit (waning). Krishna 15 = New Moon.
       
       if (!isWaxing) {
           pct = 1 - (day / 15);
       }
       
       // Clamp
       return Math.max(0.05, Math.min(0.95, pct));
  }



  // --- Sun Arc Math ---
  const percent = heroData.sun_position_percent // 0 to 100
  const angleRad = Math.PI - (percent / 100) * Math.PI
  const r = 90
  const cx = 100 + r * Math.cos(angleRad)
  const cy = 100 - r * Math.sin(angleRad)
  const sunLeft = (cx / 200) * 100
  const sunTop = (cy / 100) * 100

  // Colors
  const getPillColor = () => {
    if (!currentChaughadiya) return "border-violet-500/30 text-violet-300"
    if (currentChaughadiya.type === "Good")
      return "border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-500/10"
    if (currentChaughadiya.type === "Bad")
      return "border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-500/10"
    return "border-amber-500/40 text-amber-400 bg-amber-500/10"
  }

  const getDotColor = () => {
    if (!currentChaughadiya) return "bg-violet-400"
    if (currentChaughadiya.type === "Good") return "bg-emerald-500"
    if (currentChaughadiya.type === "Bad") return "bg-red-500"
    return "bg-amber-500"
  }

  const getHoraColor = (color: string) => {
      switch(color) {
          case 'gold': return "border-yellow-400/50 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)] bg-yellow-400/10";
          case 'green': return "border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-500/10";
          case 'red': return "border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-500/10";
          case 'purple': return "border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-500/10";
          case 'orange': return "border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-orange-500/10";
          case 'black': return "border-slate-500/40 text-slate-400 bg-slate-500/10";
          default: return "border-white/20 text-white/80 bg-white/5";
      }
  }

  // Format date correctly
  const formattedDate = !isNaN(new Date(displayDate).getTime()) 
      ? new Date(displayDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : displayDate;

  // --- Moon Phase Visuals ---
  // --- Moon Visuals (Simplified) ---
  const getMoonShadowStyle = () => {
    // User requested to remove the complex shading constraint.
    // We will render a clean, glowing moon.
    
    // Simple Moon Look
    return {
        background: "#e2e8f0", // Moon White
        boxShadow: "0 0 30px rgba(226, 232, 240, 0.3)", // Soft Glow
        border: "1px solid rgba(255,255,255,0.1)"
    }
  }

  // Check if Sun should be visible (Daytime only)
  // Day = sunrise < now < sunset.
  const isDay = !isNight;

  return (
    <div className="relative w-full flex flex-col items-center justify-start pt-6 pb-8 overflow-hidden">
      {/* Background Cosmic Glow - Changes based on Night/Day */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-colors duration-1000
        ${isNight ? "bg-indigo-900/10" : "bg-amber-500/5"} animate-cosmic-pulse`} 
      />

      {/* 1. Date & Time */}
      <div className="z-10 text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide mb-1">{formattedDate}</h2>
        <div className={`text-3xl md:text-4xl font-mono font-bold text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]
            ${isNight ? "bg-gradient-to-r from-indigo-200 to-white" : "bg-gradient-to-r from-amber-200 to-amber-500"}`}>
          {currentTime || "--:--:-- --"}
        </div>
        <p className="text-sm text-violet-300/60 mt-2 font-medium">
          {coreData.tithi.name} ({coreData.tithi.paksha})
        </p>
      </div>

      {/* 2. Arc / Center Visual - ALWAYS Visible */}
      <div className="relative w-[320px] h-[160px] md:w-[400px] md:h-[200px]">
         
         {/* If Night: Show Moon in Center (On top of Arc) - Reduced Size & Aligned */}
         {isNight && (
             <div className="absolute inset-x-0 top-[40px] flex justify-center z-10">
                 <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="w-16 h-16 rounded-full relative overflow-hidden" 
                    style={getMoonShadowStyle()}
                 >
                    {/* Texture dots (Subtle) */}
                    <div className="absolute top-3 left-4 w-2 h-2 rounded-full bg-slate-300/20" />
                    <div className="absolute bottom-5 right-5 w-3 h-3 rounded-full bg-slate-300/20" />
                    <div className="absolute top-8 right-3 w-1.5 h-1.5 rounded-full bg-slate-300/20" />
                 </motion.div>
             </div>
         )}

         {/* Arc Track - Always Visible */}
         <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 200 110">
            <defs>
            {/* Solid Line, 3 Colors: Violet -> Amber -> Violet */}
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="1" />   {/* Violet Start */}
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />   {/* Amber Middle */}
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" /> {/* Violet End */}
            </linearGradient>
            </defs>

            {/* Base Track (Faint) */}
            <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.05"
            strokeWidth="1"
            strokeDasharray="4 4"
            />

            {/* Active Path - Solid Gradient Line */}
            <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#arcGradient)"
            strokeOpacity="1"
            strokeWidth="4"
            strokeLinecap="round"
            filter="drop-shadow(0 0 4px rgba(245, 158, 11, 0.3))"
            />
            
            {/* Markers */}
            <circle cx="10" cy="100" r="3" fill="#8b5cf6" />
            <circle cx="190" cy="100" r="3" fill="#8b5cf6" />
        </svg>

        {/* Sun Object - Only Visible if Day */}
        {isDay && (
            <motion.div
                className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, left: `${sunLeft}%`, top: `${sunTop}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
            >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-100 via-amber-400 to-orange-500 shadow-[0_0_25px_rgba(251,191,36,0.8)] flex items-center justify-center border border-amber-200">
                <div className="w-full h-full rounded-full border border-white/30 animate-spin-slow" />
                </div>
            </motion.div>
        )}

        {/* Arc Labels */}
        <div className="absolute bottom-[-10px] left-[-40px] md:left-[-60px] text-xs text-violet-300/50 font-mono flex flex-col items-center">
            <span className="text-amber-400/80 mb-1">Sunrise</span>
            {heroData.sunrise}
        </div>
        <div className="absolute bottom-[-10px] right-[-40px] md:right-[-60px] text-xs text-violet-300/50 font-mono flex flex-col items-center">
            <span className="text-amber-400/80 mb-1">Sunset</span>
            {heroData.sunset}
        </div>

        {/* Status Pills Container - Centered Bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 z-20 flex flex-col items-center gap-2">
            
            {/* 1. Chaughadiya Pill */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => currentChaughadiya && onChaughadiyaClick?.(currentChaughadiya.name)}
                className={`px-5 py-2 rounded-full backdrop-blur-md border flex items-center gap-3 transition-colors duration-300 cursor-pointer ${getPillColor()}`}
            >
                <div className="relative">
                    <div className={`w-2.5 h-2.5 rounded-full ${getDotColor()} z-10 relative`} />
                    <div className={`absolute inset-0 rounded-full ${getDotColor()} animate-ping opacity-75`} />
                </div>
                
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    {currentChaughadiya
                    ? `${currentChaughadiya.name} (${currentChaughadiya.meaning.split(" ")[0]})`
                    : "Calculating..."}
                </span>
             </motion.div>

            {/* 2. Hora Pill (New) */}
            {currentHora && (
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => onHoraClick?.(currentHora.planet)}
                    className={`px-4 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 cursor-pointer ${getHoraColor(currentHora.color)}`}
                >
                     <span className="text-[10px] opacity-70 uppercase tracking-wider">Hora:</span>
                     <span className="text-xs font-bold uppercase tracking-wide">
                        {currentHora.planet}
                     </span>
                     <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                     <span className="text-[10px] italic opacity-80 truncate max-w-[120px]">
                        {currentHora.type}
                     </span>
                </motion.div>
            )}

        </div>
      </div>
      
      <div className="h-4" />
    </div>
  )
}

export default SunArcHero
