"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Loader2, Newspaper } from "lucide-react"

interface Props {
  onSubmit: (text: string) => void
  isLoading: boolean
}

export function NewsInput({ onSubmit, isLoading }: Props) {
  const [text, setText] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    onSubmit(text.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (text.trim() && !isLoading) onSubmit(text.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Newspaper className="h-3.5 w-3.5 text-terminal-amber" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-terminal-amber">
          NEWS INPUT
        </span>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Enter macroeconomic news or policy events...\ne.g. FRBが50bpsの利上げを実施\ne.g. 日銀がYCC解除を決定"}
          rows={5}
          className="w-full resize-none rounded border border-border bg-background px-3 py-2.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-terminal-green/60 focus:outline-none focus:ring-1 focus:ring-terminal-green/30"
        />
        <div className="absolute bottom-2 right-2 text-[9px] text-muted-foreground/30">
          Ctrl+Enter
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading || !text.trim()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 rounded border border-terminal-green/60 bg-terminal-green/10 py-2.5 text-xs font-bold tracking-[0.15em] text-terminal-green transition-colors hover:bg-terminal-green/20 disabled:opacity-30 disabled:hover:bg-terminal-green/10"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ANALYZING...
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            ANALYZE
          </>
        )}
      </motion.button>
    </form>
  )
}
