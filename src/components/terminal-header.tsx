"use client"

import { useEffect, useState } from "react"
import { Activity, Zap } from "lucide-react"

export function TerminalHeader() {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("ja-JP", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      )
      setDate(
        now.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 py-2.5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-terminal-green" fill="currentColor" />
          <span className="text-base font-bold tracking-[0.25em] text-terminal-green">
            MUNDEL
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-[10px] tracking-wider text-muted-foreground">
          Mundell-Fleming FX Analysis Terminal
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Activity className="h-3 w-3 text-terminal-green" />
          <span>IS-LM-BP</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-[11px] tabular-nums">
          <span className="text-muted-foreground">{date}</span>
          <span className="text-terminal-amber">{time}</span>
        </div>
      </div>
    </header>
  )
}
