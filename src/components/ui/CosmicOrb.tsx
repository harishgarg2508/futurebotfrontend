"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export const CosmicOrb = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const particles: {
      x: number
      y: number
      z: number
      size: number
      color: string
      speed: number
      offset: number
    }[] = []

    // Initialize particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        z: (Math.random() - 0.5) * 100,
        size: Math.random() * 2 + 0.5,
        color: i % 2 === 0 ? "#a78bfa" : "#22d3ee", // Violet or Cyan
        speed: 0.005 + Math.random() * 0.01,
        offset: Math.random() * Math.PI * 2,
      })
    }

    const render = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw core glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 60)
      gradient.addColorStop(0, "rgba(167, 139, 250, 0.8)") // Violet core
      gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.3)") // Cyan mid
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Sort particles by Z for depth
      particles.sort((a, b) => {
        const zA = a.z * Math.cos(time) - a.x * Math.sin(time)
        const zB = b.z * Math.cos(time) - b.x * Math.sin(time)
        return zA - zB
      })

      particles.forEach((p) => {
        // Rotate around Y axis
        const x = p.x * Math.cos(time + p.speed) - p.z * Math.sin(time + p.speed)
        const z = p.z * Math.cos(time + p.speed) + p.x * Math.sin(time + p.speed)
        
        // Rotate around X axis (slight tilt)
        const y = p.y * Math.cos(time * 0.5) - z * Math.sin(time * 0.5)
        const zFinal = z * Math.cos(time * 0.5) + p.y * Math.sin(time * 0.5)

        // Project to 2D
        const scale = (zFinal + 200) / 200
        const screenX = centerX + x * scale
        const screenY = centerY + y * scale

        if (scale > 0) {
          ctx.beginPath()
          ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = Math.min(1, (zFinal + 100) / 200) // Fade out at back
          ctx.fill()
          
          // Glow for closer particles
          if (zFinal > 0) {
             ctx.shadowBlur = 10 * scale
             ctx.shadowColor = p.color
             ctx.fill()
             ctx.shadowBlur = 0
          }
          ctx.globalAlpha = 1
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className="relative w-40 h-40 flex items-center justify-center"
    >
      <canvas ref={canvasRef} width={160} height={160} className="w-full h-full" />
    </motion.div>
  )
}
