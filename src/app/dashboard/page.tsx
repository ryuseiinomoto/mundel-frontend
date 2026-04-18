"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { TerminalHeader } from "@/components/terminal-header"
import { NewsInput } from "@/components/news-input"
import { ISLMBPGraph } from "@/components/is-lm-bp-graph"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import { MarketCards } from "@/components/market-cards"
import { NewsFeed } from "@/components/news-feed"
import { NewsSentiment } from "@/components/news-sentiment"
import { StatusTicker } from "@/components/status-ticker"
import { AlertCircle } from "lucide-react"
import type { AnalysisResult, ShiftState } from "@/lib/types"
import "@/i18n"

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (typeof window !== "undefined") {
  console.log("[Mundel] NEXT_PUBLIC_API_URL:", API_URL ?? "(未設定・フォールバック使用)")
}

function getApiBase(): string {
  if (API_URL && API_URL.trim()) {
    return API_URL.replace(/\/$/, "")
  }
  if (typeof window === "undefined") {
    return "http://localhost:8080"
  }
  const hostname = window.location.hostname
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8080"
  }
  return "https://mundel-backend-490996932437.europe-west1.run.app"
}

export default function MundelDashboard() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [shifts, setShifts] = useState<ShiftState>({ is: 0, lm: 0, bp: 0 })
  const [analysisResult, setAnalysisResult] = useState<{
    is_shift: number
    lm_shift: number
    bp_shift: number
    equilibrium_e0: { y: number; r: number }
    predicted_equilibrium: { y: number; r: number }
  } | null>(null)
  const [macroEffects, setMacroEffects] = useState<{
    exchange_rate: string
    interest_rate: string
    output: string
    capital_flow: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [usdjpy, setUsdjpy] = useState<string>("---")
  const [interestRate, setInterestRate] = useState<string>("---")
  const [cpi, setCpi] = useState<string>("---")

  useEffect(() => {
    setMounted(true)
  }, [])

  const apiBase = getApiBase()

  useEffect(() => {
    if (!mounted) return
    const fetchMarketData = async () => {
      try {
        const res = await fetch(`${apiBase}/api/analysis`)
        if (!res.ok) return
        const raw = await res.json()
        const te = raw.te_macro_snapshot ?? {}
        const market = raw.market_data ?? {}
        const exchange = market.exchange ?? {}
        const indicators = market.indicators ?? {}

        const jpy =
          te.usd_jpy ?? exchange.current_price ?? null
        const rate =
          te.us_policy_rate ??
          indicators.us_policy_rate ??
          null
        const cpiVal =
          te.us_cpi_yoy ??
          indicators.us_cpi ??
          null

        if (jpy != null && typeof jpy === "number") {
          setUsdjpy(jpy.toFixed(2))
        }
        if (rate != null && typeof rate === "number") {
          setInterestRate(`${rate.toFixed(2)}%`)
        }
        if (cpiVal != null && typeof cpiVal === "number") {
          setCpi(`${cpiVal.toFixed(2)}%`)
        }
      } catch {
        // 取得失敗時は --- のまま
      }
    }
    fetchMarketData()
  }, [mounted, apiBase])

  const handleAnalyze = useCallback(async (newsText: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news_text: newsText }),
      })

      if (!res.ok) throw new Error(`Error ${res.status}`)

      const raw = await res.json()
      const analysis = raw.analysis ?? {}
      const market = raw.market_data ?? {}
      const te = raw.te_macro_snapshot ?? {}
      const exchange = market.exchange ?? {}
      const indicators = market.indicators ?? {}

      const jpy = te.usd_jpy ?? exchange.current_price ?? null
      const rate = te.us_policy_rate ?? indicators?.us_policy_rate ?? null
      const cpiVal = te.us_cpi_yoy ?? indicators?.us_cpi ?? null
      if (jpy != null && typeof jpy === "number") setUsdjpy(jpy.toFixed(2))
      if (rate != null && typeof rate === "number") setInterestRate(`${rate.toFixed(2)}%`)
      if (cpiVal != null && typeof cpiVal === "number") setCpi(`${cpiVal.toFixed(2)}%`)

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
      const delta = raw.shifts_delta ?? {}
      const toNum = (v: unknown): number => {
        if (typeof v === "number" && !Number.isNaN(v))
          return Math.max(-10, Math.min(10, v))
        return 0
      }
      /** LM曲線: "left"=正（左シフト・利上げ）、"right"=負（右シフト・利下げ） */
      const toLmNum = (v: unknown): number => {
        const n = toNum(v)
        if (n !== 0) return n
        const s = String(v ?? "").trim().toLowerCase()
        if (s === "left") return 5
        if (s === "right") return -5
        return 0
      }
      const isVal = toNum(delta.is ?? analysis.is_shift)
      const lmVal = toLmNum(delta.lm ?? analysis.lm_shift)
      const bpVal = toNum(delta.bp ?? analysis.bp_shift)
      setShifts({ is: isVal, lm: lmVal, bp: bpVal })

      const e0 = raw.equilibrium_e0
      const e1 = raw.equilibrium_e1
      if (
        e0 &&
        typeof e0.y === "number" &&
        typeof e0.r === "number" &&
        e1 &&
        typeof e1.y === "number" &&
        typeof e1.r === "number"
      ) {
        setAnalysisResult({
          is_shift: isVal,
          lm_shift: lmVal,
          bp_shift: bpVal,
          equilibrium_e0: { y: e0.y, r: e0.r },
          predicted_equilibrium: { y: e1.y, r: e1.r },
        })
      } else {
        setAnalysisResult(null)
      }

      // macro_effects を保存（バックエンドから返却）
      const me = raw.macro_effects
      if (me && typeof me === "object") {
        setMacroEffects({
          exchange_rate: String(me.exchange_rate ?? "").trim() || "Neutral",
          interest_rate: String(me.interest_rate ?? "").trim() || "Neutral",
          output: String(me.output ?? "").trim() || "Neutral",
          capital_flow: String(me.capital_flow ?? "").trim() || "Neutral",
        })
      } else {
        setMacroEffects(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [apiBase])

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
              fxRate={usdjpy}
              usInterestRate={interestRate}
              cpi={cpi}
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

      {/* Main Content: Graph | AI Insights | Right Column */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Graph + AI Insights 横並び */}
        <div className="flex w-[60%] min-w-0 border-r border-border">
          {/* IS-LM-BP Graph */}
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
                {t('IS_LM_BP_MODEL')}
              </span>
              <div className="flex items-center gap-3">
                {[
                  { label: "IS", shift: shifts.is, color: "text-terminal-green", invert: false },
                  { label: "LM", shift: shifts.lm, color: "text-terminal-amber", invert: true },
                  { label: "BP", shift: shifts.bp, color: "text-terminal-cyan", invert: false },
                ].map((s) => {
                  const dir = s.shift > 0 ? "R" : s.shift < 0 ? "L" : "-"
                  const display = s.invert ? (s.shift > 0 ? "L" : s.shift < 0 ? "R" : "-") : dir
                  return (
                    <span key={s.label} className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">{s.label}:</span>
                      <span className={`text-[10px] font-bold ${s.color}`}>{display}</span>
                    </span>
                  )
                })}
                <span className="text-[9px] text-muted-foreground/40">
                  {result ? (result.regime ?? t('READY')).toUpperCase() : t('READY')}
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ISLMBPGraph
                shifts={shifts}
                isAnimating={isLoading}
                analysisResult={analysisResult}
              />
            </div>
          </div>

          {/* AI Insights パネル（グラフ右隣・スクロール可能） */}
          <div className="flex w-[320px] shrink-0 flex-col border-l border-border">
            <AIAnalysisPanel
              result={result}
              shifts={shifts}
              macroEffects={macroEffects}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* RIGHT SIDE: 40% - Economic Calendar + News */}
        <div className="flex w-[40%] flex-col">
          <div className="flex h-[55%] flex-col border-b border-border">
            <NewsFeed onAnalyze={handleAnalyze} />
          </div>
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

