"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TerminalHeader } from "@/components/terminal-header"
import { NewsInput } from "@/components/news-input"
import { ISLMBPGraph } from "@/components/is-lm-bp-graph"
import { ResultPanels } from "@/components/result-panels"
import { MarketCards } from "@/components/market-cards"
import { StatusTicker } from "@/components/status-ticker"
import {
  ArrowRightLeft,
  Clock,
  AlertCircle,
} from "lucide-react"
import type { AnalysisResult, ShiftState } from "@/lib/types"
import { directionToNumber } from "@/lib/types"

interface LogEntry {
  time: string
  text: string
  effectiveness: string
}

export default function MundelDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [shifts, setShifts] = useState<ShiftState>({ is: 0, lm: 0, bp: 0 })
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async (newsText: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("https://mundel-backend-490996932437.europe-west1.run.app/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ news_text: newsText }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`)

      const raw = await res.json()
      const analysis = raw.analysis ?? {}
      const market = raw.market_data ?? {}
      const data: AnalysisResult = {
        ...raw,
        is_shift: analysis.is_shift,
        lm_shift: analysis.lm_shift,
        bp_shift: analysis.bp_shift,
        logic_jp: analysis.logic_jp,
        fx_rate: market.exchange?.current_price,
        us_interest_rate: market.indicators?.us_policy_rate,
        cpi: market.indicators?.us_cpi,
      }
      setResult(data)
      setShifts({
        is: directionToNumber(analysis.is_shift),
        lm: directionToNumber(analysis.lm_shift),
        bp: directionToNumber(analysis.bp_shift),
      })

      const now = new Date()
      setLogs((prev) => [
        {
          time: now.toLocaleTimeString("ja-JP", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          text: newsText.slice(0, 40) + (newsText.length > 40 ? "..." : ""),
          effectiveness: data.policy_effectiveness ?? "—",
        },
        ...prev.slice(0, 9),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TerminalHeader />

      {/* Market Cards Bar */}
      <div className="border-b border-border bg-card px-5 py-2.5">
        <MarketCards
          fxRate={result?.fx_rate}
          usInterestRate={result?.us_interest_rate}
          cpi={result?.cpi}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside className="flex w-[320px] shrink-0 flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground">
              CONTROL PANEL
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <NewsInput onSubmit={handleAnalyze} isLoading={isLoading} />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded border border-red-500/30 bg-red-500/5 p-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-[9px] tracking-wider text-red-500">ERROR</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-red-500/70">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shift Info */}
              <div className="flex items-center justify-between rounded border border-border bg-background/50 px-3 py-2">
                {[
                  { label: "IS", value: shifts.is, colorClass: "text-green-600 dark:text-green-400" },
                  { label: "LM", value: shifts.lm, colorClass: "text-amber-600 dark:text-amber-400" },
                  { label: "BP", value: shifts.bp, colorClass: "text-cyan-600 dark:text-cyan-400" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground">{s.label}:</span>
                    <span className={`text-[11px] font-bold ${s.colorClass}`}>
                      {s.value > 0 ? "RIGHT" : s.value < 0 ? "LEFT" : "---"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Log */}
              {logs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[9px] tracking-[0.15em] text-muted-foreground/50">
                      HISTORY
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {logs.map((entry, i) => (
                      <div
                        key={`${entry.time}-${i}`}
                        className="flex items-center gap-2 rounded px-2 py-1 text-[9px] transition-colors hover:bg-secondary/30"
                      >
                        <span className="shrink-0 tabular-nums text-muted-foreground/50">
                          {entry.time}
                        </span>
                        <span className="flex-1 truncate text-foreground/60">
                          {entry.text}
                        </span>
                        <span className="shrink-0 text-green-600 dark:text-green-400">
                          {entry.effectiveness}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Center - Graph */}
        <main className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-2">
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground">
              IS-LM-BP MODEL
            </span>
            <span className="text-[9px] text-muted-foreground/50">
                {result ? (
                <span>
                  <span className="text-green-600 dark:text-green-400">RESULT LOADED</span>
                  {result.regime ? ` | ${result.regime.toUpperCase()}` : ""}
                </span>
              ) : (
                "READY"
              )}
            </span>
          </div>
          <div className="flex-1 p-2">
            <ISLMBPGraph shifts={shifts} isAnimating={isLoading} />
          </div>
        </main>

        {/* Right Panel - Results */}
        <aside className="flex w-[340px] shrink-0 flex-col border-l border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground">
              ANALYSIS OUTPUT
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <ResultPanels result={result} shifts={shifts} />
            </div>
          </div>
        </aside>
      </div>

      <StatusTicker />
    </div>
  )
}
