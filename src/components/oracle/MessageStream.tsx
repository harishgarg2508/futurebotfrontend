"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface MessageStreamProps {
  content: string
  isStreaming?: boolean
}

export const MessageStream: React.FC<MessageStreamProps> = ({ content, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? "" : content)
  const [isComplete, setIsComplete] = useState(!isStreaming)

  useEffect(() => {
    // If not streaming, show full content immediately
    if (!isStreaming) {
      setDisplayedContent(content)
      setIsComplete(true)
      return
    }

    // Reset for streaming
    setDisplayedContent("")
    setIsComplete(false)
    
    // Stream the content character by character
    let i = 0
    const interval = setInterval(() => {
      if (i <= content.length) {
        setDisplayedContent(content.substring(0, i))
        i++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 15)

    return () => clearInterval(interval)
  }, [content, isStreaming])

  return (
    <div className="prose prose-sm max-w-none">
      <p className="whitespace-pre-wrap leading-relaxed text-slate-200/90">
        {displayedContent}
        {isStreaming && !isComplete && (
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "easeInOut" }}
            className="inline-block w-0.5 h-4 bg-gradient-to-b from-violet-400 to-rose-400 ml-1 align-middle rounded-full"
          />
        )}
      </p>
    </div>
  )
}
