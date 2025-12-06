"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Send, Sparkles, Stars } from "lucide-react"
import { MessageStream } from "./MessageStream"
import { BilingualToggle } from "./BilingualToggle"
import { useChatSync } from "@/hooks/useChatSync"
import { sendMessageToFirebase } from "@/services/firebaseService"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

export const ChatInterface: React.FC = () => {
  const { currentProfile, chatHistory, language } = useAppStore()
  const { user } = useAuth()
  useChatSync()

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [latestAiMessageId, setLatestAiMessageId] = useState<string | null>(null)
  const initialLoadRef = useRef(true)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory, isTyping])

  // Track initial messages loaded from history - don't stream these
  useEffect(() => {
    if (chatHistory.length > 0 && initialLoadRef.current) {
      // After a brief delay, mark initial load as complete
      const timer = setTimeout(() => {
        initialLoadRef.current = false
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [chatHistory])

  useEffect(() => {
    if (currentProfile && chatHistory.length === 0 && user) {
      const greeting =
        language === "en"
          ? `I have opened the scroll for ${currentProfile.name}. I see the stars are aligned. What do you wish to ask?`
          : `मैंने ${currentProfile.name} के लिए कुंडली खोल ली है। मैं देख रहा हूँ कि तारे के अनुकूल हैं। आप क्या पूछना चाहते हैं?`

      const initMsg = {
        id: "init-1",
        role: "assistant" as const,
        content: greeting,
        timestamp: Date.now(),
      }

      sendMessageToFirebase(user.uid, currentProfile.id, initMsg)
    }
  }, [currentProfile, language, chatHistory.length, user])

  const handleSend = async () => {
    if (!input.trim() || !currentProfile || !user) return

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input,
      timestamp: Date.now(),
    }

    await sendMessageToFirebase(user.uid, currentProfile.id, userMsg)

    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userData: {
            name: currentProfile.name,
            date: currentProfile.date,
            time: currentProfile.time,
            location: {
              lat: currentProfile.location.lat,
              lon: currentProfile.location.lon,
              name: currentProfile.location.city,
            },
            timezone: "Asia/Kolkata",
            language: language,
          },
          chartData: useAppStore.getState().currentChartData,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Oracle is silent (API Error)")
      }

      const data = await response.json()

      const aiMsgId = crypto.randomUUID()
      const aiMsg = {
        id: aiMsgId,
        role: "assistant" as const,
        content: data.response || "The stars are silent.",
        timestamp: Date.now(),
      }

      setLatestAiMessageId(aiMsgId)

      await sendMessageToFirebase(user.uid, currentProfile.id, aiMsg)
      setIsTyping(false)
    } catch (error) {
      console.error(error)
      setIsTyping(false)
    }
  }

  if (!currentProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 p-8">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-rose-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 to-violet-950 border border-violet-400/20 flex items-center justify-center">
            <Stars className="w-8 h-8 text-violet-300/60" />
          </div>
        </motion.div>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Select a chart from the library to consult the Oracle
        </p>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex flex-col relative bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-violet-400/10 bg-slate-900/50 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 ml-12">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-400 to-rose-400 animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-violet-400/50 animate-ping" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Celestial Oracle</h2>
            <p className="text-xs text-slate-400">
              Consulting: <span className="text-violet-300 font-medium">{currentProfile.name}</span>
            </p>
          </div>
        </div>
        {/* Language toggle with right margin to avoid overlap with sidebar toggle */}
        <div className="mr-14">
          <BilingualToggle />
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto min-h-0 custom-scrollbar p-6 space-y-6" ref={scrollRef}>
        <AnimatePresence>
          {chatHistory.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-500 to-rose-500 text-white rounded-tr-sm shadow-lg shadow-violet-500/20"
                    : "bg-slate-900/80 backdrop-blur-sm border border-violet-400/10 text-slate-200 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-violet-400/10">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-widest">Oracle</span>
                  </div>
                )}
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <MessageStream 
                    content={msg.content} 
                    isStreaming={!initialLoadRef.current && msg.id === latestAiMessageId} 
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="px-5 py-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl rounded-tl-sm border border-violet-400/10 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-slate-900/50 backdrop-blur-xl border-t border-violet-400/10"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-5 py-3.5 bg-slate-900/80 backdrop-blur-sm border border-violet-400/20 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/10 transition-all text-sm"
              placeholder={language === "en" ? "Ask the stars..." : "तारों से पूछें..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-5 rounded-xl bg-gradient-to-r from-violet-500 to-rose-500 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
