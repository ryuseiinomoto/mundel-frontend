"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Brain, ChevronRight, Zap } from "lucide-react"
import { ISLMBPGraph } from "@/components/is-lm-bp-graph"
import { withTooltips } from "@/components/economic-tooltip"
import type { ShiftState } from "@/lib/types"

const STORAGE_KEY = "mundel_analysis_result"

export default function ModelPage() {
  const router = useRouter()
  const [shifts, setShifts] = useState<ShiftState>({ is: 0, lm: 0, bp: 0 })
  const [analysisResult, setAnalysisResult] = useState<{
    is_shift: number; lm_shift: number; bp_shift: number
    equilibrium_e0: { y: number; r: number }
    predicted_equilibrium: { y: number; r: number }
  } | null>(null)
  const [hasData, setHasData] = useState(false)
  const [logicJp, setLogicJp] = useState<string>("")
  const [shiftSummary, setShiftSummary] = useState<{ is: number; lm: number; bp: number } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      const delta = data.shifts_delta ?? {}
      const toNum = (v: unknown): number => {
        if (typeof v === "number" && !Number.isNaN(v)) return Math.max(-10, Math.min(10, v))
        return 0
      }
      const isVal = toNum(delta.is ?? data.analysis?.is_shift)
      const lmVal = toNum(delta.lm ?? data.analysis?.lm_shift)
      const bpVal = toNum(delta.bp ?? data.analysis?.bp_shift)
      setShifts({ is: isVal, lm: lmVal, bp: bpVal })
      setShiftSummary({ is: isVal, lm: lmVal, bp: bpVal })
      const e0 = data.equilibrium_e0
      const e1 = data.equilibrium_e1
      if (e0 && e1) {
        setAnalysisResult({
          is_shift: isVal, lm_shift: lmVal, bp_shift: bpVal,
          equilibrium_e0: { y: e0.y, r: e0.r },
          predicted_equilibrium: { y: e1.y, r: e1.r },
        })
      }
      const logic = data.analysis?.logic_jp ?? ""
      if (logic) setLogicJp(logic)
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
        <span className="text-[10px] font-bold tracking-[0.35em]" style={{ color: "rgba(0,255,128,0.5)" }}>
          IS-LM-BP MODEL
        </span>
        {/* シフト表示 */}
        <div className="flex items-center gap-3">
          {[
            { label: "IS", shift: shifts.is, color: "rgba(0,255,128,0.8)" },
            { label: "LM", shift: shifts.lm, color: "rgba(234,179,8,0.8)" },
            { label: "BP", shift: shifts.bp, color: "rgba(0,210,230,0.8)" },
          ].map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <span className="text-[9px] text-white/20">{s.label}:</span>
              <span className="text-[10px] font-bold" style={{ color: s.shift !== 0 ? s.color : "rgba(255,255,255,0.68)" }}>
                {s.shift > 0 ? "R" : s.shift < 0 ? "L" : "—"}
              </span>
            </span>
          ))}
        </div>
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
          <div className="flex flex-col">
            {/* グラフ */}
            <div className="h-[420px]">
              <ISLMBPGraph shifts={shifts} isAnimating={false} analysisResult={analysisResult} />
            </div>

            {/* カーブシフト */}
            {shiftSummary && (
              <div className="border-t border-white/6 px-6 py-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" style={{ color: "rgba(0,210,230,0.6)" }} />
                  <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "rgba(0,210,230,0.6)" }}>
                    CURVE SHIFTS
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
                  <span>
                    <span style={{ color: "rgba(0,255,128,0.7)" }}>IS: </span>
                    <span style={{ color: "rgba(255,255,255,0.72)" }}>
                      {shiftSummary.is > 0
                        ? `右シフト (+${shiftSummary.is.toFixed(1)}) — 財政拡張・輸出増加`
                        : shiftSummary.is < 0
                        ? `左シフト (${shiftSummary.is.toFixed(1)}) — 財政緊縮・輸入増加`
                        : "中立"}
                    </span>
                  </span>
                  <span>
                    <span style={{ color: "rgba(234,179,8,0.7)" }}>LM: </span>
                    <span style={{ color: "rgba(255,255,255,0.72)" }}>
                      {shiftSummary.lm < 0
                        ? "左シフト — 金融引き締め・利上げ"
                        : shiftSummary.lm > 0
                        ? "右シフト — 金融緩和・利下げ"
                        : "中立"}
                    </span>
                  </span>
                  <span>
                    <span style={{ color: "rgba(0,210,230,0.7)" }}>BP: </span>
                    <span style={{ color: "rgba(255,255,255,0.72)" }}>
                      {shiftSummary.bp > 0
                        ? `上シフト (+${shiftSummary.bp.toFixed(1)}) — 資本流入`
                        : shiftSummary.bp < 0
                        ? `下シフト (${shiftSummary.bp.toFixed(1)}) — 資本流出`
                        : "中立"}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* AI解説 */}
            {logicJp && (
              <div className="border-t border-white/6 px-6 py-5">
                <div className="mb-3 flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5" style={{ color: "rgba(0,210,230,0.6)" }} />
                  <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "rgba(0,210,230,0.6)" }}>
                    AI 解説
                  </span>
                </div>
                <p className="text-[13px] leading-[1.85]" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {withTooltips(logicJp)}
                </p>
              </div>
            )}

            {/* 次へ */}
            <div className="border-t border-white/6 px-6 py-5">
              <button
                onClick={() => router.push("/signal")}
                className="group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold tracking-wide transition-all"
                style={{
                  border: "1px solid rgba(0,210,230,0.25)",
                  background: "rgba(0,210,230,0.05)",
                  color: "rgba(0,210,230,0.8)",
                }}
              >
                <Zap className="h-3.5 w-3.5" />
                AIシグナルを確認する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
