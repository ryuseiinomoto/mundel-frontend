"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Brain, Loader2, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, Activity } from "lucide-react"
import type { AnalysisResult, ShiftState } from "@/lib/types"
import { withTooltips } from "@/components/economic-tooltip"

interface MacroEffects {
  exchange_rate: string
  interest_rate: string
  output: string
  capital_flow: string
}

interface Props {
  result: AnalysisResult | null
  shifts: ShiftState
  macroEffects: MacroEffects | null
  isLoading: boolean
}

function EffectBadge({ effect }: { effect: string | undefined }) {
  if (!effect) return <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
  const n = effect.toLowerCase()
  const isUp =
    n.includes("increase") || n.includes("up") || n.includes("appreciation") ||
    n.includes("expand") || n.includes("inflow")
  const isDown =
    n.includes("decrease") || n.includes("down") || n.includes("depreciation") ||
    n.includes("contract") || n.includes("outflow")

  if (isUp) return (
    <span className="inline-flex items-center gap-1" style={{ color: "rgba(0,255,128,0.8)" }}>
      <ArrowUpRight className="h-3 w-3" />
      <span className="text-[11px]">{effect}</span>
    </span>
  )
  if (isDown) return (
    <span className="inline-flex items-center gap-1" style={{ color: "rgba(239,68,68,0.8)" }}>
      <ArrowDownRight className="h-3 w-3" />
      <span className="text-[11px]">{effect}</span>
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1" style={{ color: "rgba(220,180,60,0.8)" }}>
      <Minus className="h-3 w-3" />
      <span className="text-[11px]">{effect}</span>
    </span>
  )
}

function ShiftBar({ label, value, color, invert }: { label: string; value: number; color: string; invert?: boolean }) {
  const dir = invert
    ? (value > 0 ? "LEFT" : value < 0 ? "RIGHT" : "—")
    : (value > 0 ? "RIGHT" : value < 0 ? "LEFT" : "—")
  const percent = Math.min(Math.abs(value) * 30, 100)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
        <span className="text-[10px] font-bold" style={{ color: percent > 0 ? color : "rgba(255,255,255,0.2)" }}>{dir}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

function SignalBadge({ signal, reason }: { signal?: string; reason?: string }) {
  const config =
    signal === "BUY"
      ? { icon: TrendingUp, label: "BUY USD/JPY", color: "rgba(0,255,128,0.9)", border: "rgba(0,255,128,0.25)", bg: "rgba(0,255,128,0.06)" }
      : signal === "SELL"
      ? { icon: TrendingDown, label: "SELL USD/JPY", color: "rgba(239,68,68,0.9)", border: "rgba(239,68,68,0.25)", bg: "rgba(239,68,68,0.06)" }
      : { icon: Activity, label: "HOLD", color: "rgba(220,180,60,0.9)", border: "rgba(220,180,60,0.25)", bg: "rgba(220,180,60,0.06)" }

  const Icon = config.icon

  return (
    <div className="flex flex-col gap-2.5 rounded-xl px-4 py-3.5" style={{ border: `1px solid ${config.border}`, background: config.bg }}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.3)" }}>AI SIGNAL</span>
        <span className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-[12px] font-bold tracking-[0.1em]"
          style={{ border: `1px solid ${config.border}`, background: config.bg, color: config.color }}>
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </span>
      </div>
      {reason && (
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{reason}</p>
      )}
    </div>
  )
}

export function AIAnalysisPanel({ result, shifts, macroEffects, isLoading }: Props) {
  const { t } = useTranslation()
  const me = macroEffects ?? {
    exchange_rate: result?.exchange_rate_effect ?? "",
    interest_rate: result?.interest_rate_effect ?? "",
    output: result?.output_effect ?? "",
    capital_flow: result?.capital_flow ?? "",
  }

  return (
    <div className="flex h-full flex-col">
      {/* セクションヘッダー */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/6 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Brain className="h-4 w-4" style={{ color: "rgba(220,180,60,0.7)" }} />
          <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: "rgba(220,180,60,0.8)" }}>
            AI INSIGHTS
          </span>
          <span className="text-[10px] tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
            {t("ANALYSIS_SUBTITLE")}
          </span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "rgba(0,210,230,0.7)" }} />
            <span className="text-[10px] tracking-wider" style={{ color: "rgba(0,210,230,0.7)" }}>PROCESSING...</span>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">
          {!result && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4 py-16"
            >
              <p className="text-[12px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
                分析データがありません
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-5"
            >
              {result && (
                <>
                  {/* シグナルバッジ */}
                  <SignalBadge signal={result.signal} reason={result.signal_reason} />

                  {/* カーブシフト */}
                  <section className="rounded-xl px-4 py-4" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="mb-3 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" style={{ color: "rgba(0,210,230,0.6)" }} />
                      <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: "rgba(0,210,230,0.6)" }}>
                        CURVE SHIFTS
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <ShiftBar label="IS CURVE" value={shifts.is} color="rgba(0,255,128,0.7)" />
                      <ShiftBar label="LM CURVE" value={shifts.lm} color="rgba(220,180,60,0.7)" invert />
                      <ShiftBar label="BP CURVE" value={shifts.bp} color="rgba(0,210,230,0.7)" />
                    </div>
                  </section>

                  {/* マクロ効果 */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" style={{ color: "rgba(220,180,60,0.6)" }} />
                      <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: "rgba(220,180,60,0.6)" }}>
                        MACRO EFFECTS
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "為替レート", val: me.exchange_rate },
                        { label: "金利", val: me.interest_rate },
                        { label: "産出量", val: me.output },
                        { label: "資本フロー", val: me.capital_flow },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1 rounded-xl px-3 py-2.5"
                          style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                          <span className="text-[9px] tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {item.label}
                          </span>
                          <EffectBadge effect={item.val} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 政策効果 */}
                  <section className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-[10px] tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                      政策効果
                    </span>
                    <span className="rounded-lg px-3 py-1 text-[11px] font-bold tracking-wider"
                      style={{ background: "rgba(0,255,128,0.1)", color: "rgba(0,255,128,0.8)" }}>
                      {(result.policy_effectiveness ?? "—").toUpperCase()}
                    </span>
                  </section>

                  {/* AI詳細解説 */}
                  <section className="rounded-xl px-5 py-5"
                    style={{ border: "1px solid rgba(0,210,230,0.15)", background: "rgba(0,210,230,0.03)" }}>
                    <div className="mb-4 flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5" style={{ color: "rgba(0,210,230,0.6)" }} />
                      <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: "rgba(0,210,230,0.6)" }}>
                        詳細解説
                      </span>
                    </div>
                    <p className="text-[13px] leading-[1.85]" style={{ color: "rgba(255,255,255,0.78)" }}>
                      {withTooltips(result.logic_jp ?? result.explanation ?? "")}
                    </p>
                    {result.summary && (
                      <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <span className="text-[9px] tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>SUMMARY</span>
                        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {result.summary}
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Regime */}
                  <div className="flex items-center justify-end gap-2 text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <span>REGIME: {result.regime?.toUpperCase()}</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
