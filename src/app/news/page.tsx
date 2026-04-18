"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, BarChart2, Zap } from "lucide-react"
import { NewsInput } from "@/components/news-input"
import { MarketCards } from "@/components/market-cards"
import "@/i18n"
import { getApiBase } from "@/lib/api"

const STORAGE_KEY = "mundel_analysis_result"

export default function NewsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [usdjpy, setUsdjpy] = useState("---")
  const [interestRate, setInterestRate] = useState("---")
  const [cpi, setCpi] = useState("---")
  const apiBase = getApiBase()

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch(`${apiBase}/api/analysis`)
        if (!res.ok) return
        const raw = await res.json()
        const te = raw.te_macro_snapshot ?? {}
        const market = raw.market_data ?? {}
        const exchange = market.exchange ?? {}
        const indicators = market.indicators ?? {}
        const jpy = te.usd_jpy ?? exchange.current_price ?? null
        const rate = te.us_policy_rate ?? indicators.us_policy_rate ?? null
        const cpiVal = te.us_cpi_yoy ?? indicators.us_cpi ?? null
        if (typeof jpy === "number") setUsdjpy(jpy.toFixed(2))
        if (typeof rate === "number") setInterestRate(`${rate.toFixed(2)}%`)
        if (typeof cpiVal === "number") setCpi(`${cpiVal.toFixed(2)}%`)
      } catch { /* ignore */ }
    }
    fetchMarketData()
  }, [apiBase])

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
      setAnalyzed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [apiBase])

  return (
    <div className="relative flex min-h-screen flex-col" style={{
      background: [
        "radial-gradient(ellipse 60% 50% at 15% 60%, rgba(0,140,200,0.08) 0%, transparent 55%)",
        "radial-gradient(ellipse 50% 40% at 85% 20%, rgba(180,130,20,0.07) 0%, transparent 50%)",
        "#071e30",
      ].join(", "),
    }}>
      {/* 上部ライン */}
      <div className="absolute inset-x-0 top-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(0,160,220,0.5), rgba(180,130,30,0.3), transparent)",
      }} />

      {/* ヘッダー */}
      <div className="relative flex items-center justify-between border-b border-white/6 px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[11px] text-white/25 transition-colors hover:text-white/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <span className="text-[10px] font-bold tracking-[0.35em]" style={{ color: "rgba(0,210,230,0.5)" }}>
          NEWS ANALYSIS
        </span>
        <div className="w-16" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {/* マーケットカード */}
        <div className="mb-8">
          <MarketCards fxRate={usdjpy} usInterestRate={interestRate} cpi={cpi} />
        </div>

        {/* ページ説明 */}
        <div className="mb-5">
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(200,180,140,0.5)" }}>
            経済ニュースを入力してください。IS-LM-BPモデルがマクロ経済への影響を分析します。
          </p>
        </div>

        {/* ニュース入力 */}
        <NewsInput onSubmit={handleAnalyze} isLoading={isLoading} />

        {/* エラー */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl border px-4 py-3"
              style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)" }}
            >
              <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-[11px] text-red-400/80">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 分析完了後のナビゲーション */}
        <AnimatePresence>
          {analyzed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: "rgba(0,210,230,0.2)" }} />
                <span className="text-[9px] font-bold tracking-[0.25em]" style={{ color: "rgba(0,210,230,0.5)" }}>
                  分析完了 — 次のステップへ
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(0,210,230,0.2)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push("/model")}
                  className="group flex flex-col gap-2 rounded-xl p-4 text-left transition-all"
                  style={{
                    border: "1px solid rgba(0,255,128,0.2)",
                    background: "rgba(0,255,128,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" style={{ color: "rgba(0,255,128,0.7)" }} />
                    <span className="text-[11px] font-bold tracking-wide" style={{ color: "rgba(0,255,128,0.8)" }}>
                      IS-LM-BP Model
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    グラフで経済変化を確認する
                  </p>
                </button>
                <button
                  onClick={() => router.push("/signal")}
                  className="group flex flex-col gap-2 rounded-xl p-4 text-left transition-all"
                  style={{
                    border: "1px solid rgba(0,210,230,0.2)",
                    background: "rgba(0,210,230,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" style={{ color: "rgba(0,210,230,0.7)" }} />
                    <span className="text-[11px] font-bold tracking-wide" style={{ color: "rgba(0,210,230,0.8)" }}>
                      AI Signal
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    売買シグナルと根拠を見る
                  </p>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
