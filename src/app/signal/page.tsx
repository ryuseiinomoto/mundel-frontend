"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import type { AnalysisResult, ShiftState } from "@/lib/types"

const STORAGE_KEY = "mundel_analysis_result"

export default function SignalPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [shifts, setShifts] = useState<ShiftState>({ is: 0, lm: 0, bp: 0 })
  const [macroEffects, setMacroEffects] = useState<{
    exchange_rate: string; interest_rate: string; output: string; capital_flow: string
  } | null>(null)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      const analysis = data.analysis ?? {}
      const delta = data.shifts_delta ?? {}
      const toNum = (v: unknown): number => {
        if (typeof v === "number" && !Number.isNaN(v)) return Math.max(-10, Math.min(10, v))
        return 0
      }
      setResult({
        ...data,
        is_shift: analysis.is_shift,
        lm_shift: analysis.lm_shift,
        bp_shift: analysis.bp_shift,
        logic_jp: analysis.logic_jp,
        explanation: analysis.logic_jp,
        policy_effectiveness: analysis.policy_effectiveness ?? "—",
      })
      setShifts({
        is: toNum(delta.is ?? analysis.is_shift),
        lm: toNum(delta.lm ?? analysis.lm_shift),
        bp: toNum(delta.bp ?? analysis.bp_shift),
      })
      const me = data.macro_effects
      if (me && typeof me === "object") {
        setMacroEffects({
          exchange_rate: String(me.exchange_rate ?? "").trim() || "Neutral",
          interest_rate: String(me.interest_rate ?? "").trim() || "Neutral",
          output: String(me.output ?? "").trim() || "Neutral",
          capital_flow: String(me.capital_flow ?? "").trim() || "Neutral",
        })
      }
      setHasData(true)
    } catch { /* ignore */ }
  }, [])

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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[11px] text-white/25 transition-colors hover:text-white/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <span className="text-[10px] font-bold tracking-[0.35em]" style={{ color: "rgba(234,179,8,0.6)" }}>
          AI SIGNAL
        </span>
        <div className="w-16" />
      </div>

      {/* コンテンツ */}
      <div className="relative flex flex-1 flex-col">
        {!hasData ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="mb-3 text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>分析データがありません</p>
              <button
                onClick={() => router.push("/news")}
                className="text-[11px] underline underline-offset-4"
                style={{ color: "rgba(0,255,128,0.6)" }}
              >
                ニュースを分析する
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="mx-auto w-full max-w-xl flex-1">
              <AIAnalysisPanel
                result={result}
                shifts={shifts}
                macroEffects={macroEffects}
                isLoading={false}
              />
            </div>
            {/* 模擬トレードへ */}
            <div className="border-t border-white/6 px-6 py-5">
              <div className="mx-auto max-w-xl">
                <button
                  onClick={() => router.push("/trade")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold tracking-wide transition-all"
                  style={{
                    border: "1px solid rgba(220,180,60,0.3)",
                    background: "rgba(220,180,60,0.06)",
                    color: "rgba(220,180,60,0.9)",
                  }}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  この分析で模擬トレードする
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
