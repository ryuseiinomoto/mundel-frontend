"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { TerminalHeader } from "@/components/terminal-header"
import { NewsInput } from "@/components/news-input"
import { ISLMBPGraph } from "@/components/is-lm-bp-graph"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import { MarketCards } from "@/components/market-cards"
import { EconomicCalendar } from "@/components/economic-calendar"
import { NewsSentiment } from "@/components/news-sentiment"
import { StatusTicker } from "@/components/status-ticker"
import { AlertCircle } from "lucide-react"
import type { AnalysisResult, ShiftState } from "@/lib/types"
import { directionToNumber } from "@/lib/types"
import "@/i18n"

export default function MundelDashboard() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [shifts, setShifts] = useState<ShiftState>({ is: 0, lm: 0, bp: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAnalyze = useCallback(async (newsText: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(
        "https://mundel-backend-490996932437.europe-west1.run.app/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ news_text: newsText }),
        }
      )

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
        explanation: analysis.logic_jp,
        policy_effectiveness: analysis.policy_effectiveness ?? "—",
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Top: Terminal Header */}
      <TerminalHeader />

      {/* Market Data Bar + News Input */}
      <div className="flex items-stretch gap-0 border-b border-border">
        {/* News Input Section */}
        <div className="flex flex-1 items-center gap-4 border-r border-border bg-card/50 px-5 py-3">
          <div className="flex-1">
            <NewsInput onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>
        </div>
        {/* Market Cards */}
        <div className="flex w-[40%] shrink-0 items-center bg-card/50 px-4 py-3">
          <div className="w-full">
            <MarketCards
              fxRate={result?.fx_rate}
              usInterestRate={result?.us_interest_rate}
              cpi={result?.cpi}
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-terminal-red/30 bg-terminal-red/5 px-5 py-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-terminal-red" />
              <span className="text-[10px] tracking-wider text-terminal-red">
                {t('BACKEND_ERROR')}: {error}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDE: 60% - IS-LM-BP Graph + AI Analysis */}
        <div className="flex w-[60%] flex-col border-r border-border">
          {/* IS-LM-BP Graph */}
          <div className="relative h-[45%] min-h-[280px] border-b border-border">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
                  {t('IS_LM_BP_MODEL')}
                </span>
                <div className="flex items-center gap-3">
                  {[
                    { label: "IS", shift: shifts.is, color: "text-terminal-green" },
                    { label: "LM", shift: shifts.lm, color: "text-terminal-amber" },
                    { label: "BP", shift: shifts.bp, color: "text-terminal-cyan" },
                  ].map((s) => (
                    <span key={s.label} className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">{s.label}:</span>
                      <span className={`text-[10px] font-bold ${s.color}`}>
                        {s.shift > 0 ? "R" : s.shift < 0 ? "L" : "-"}
                      </span>
                    </span>
                  ))}
                  <span className="text-[9px] text-muted-foreground/40">
                    {result ? (result.regime ?? t('READY')).toUpperCase() : t('READY')}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <ISLMBPGraph shifts={shifts} isAnimating={isLoading} />
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="flex-1 overflow-hidden">
            <AIAnalysisPanel result={result} shifts={shifts} isLoading={isLoading} />
          </div>
        </div>

        {/* RIGHT SIDE: 40% - Economic Calendar + News */}
        <div className="flex w-[40%] flex-col">
          {/* Economic Calendar - Top */}
          <div className="flex h-[55%] flex-col border-b border-border">
            <EconomicCalendar />
          </div>

          {/* News & Sentiment - Bottom */}
          <div className="flex flex-1 flex-col">
            <NewsSentiment />
          </div>
        </div>
      </div>

      {/* Bottom: FX Ticker */}
      <StatusTicker />
    </div>
  )
}
