"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Brain, Loader2, Sparkles, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, Activity } from "lucide-react"
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
  if (!effect) return <span className="text-[11px] text-muted-foreground">—</span>
  const n = effect.toLowerCase()
  const isUp =
    n.includes("increase") || n.includes("up") || n.includes("appreciation") ||
    n.includes("expand") || n.includes("inflow")
  const isDown =
    n.includes("decrease") || n.includes("down") || n.includes("depreciation") ||
    n.includes("contract") || n.includes("outflow")

  if (isUp) {
    return (
      <span className="inline-flex items-center gap-1 text-terminal-green">
        <ArrowUpRight className="h-3 w-3" />
        <span className="text-[11px]">{effect}</span>
      </span>
    )
  }
  if (isDown) {
    return (
      <span className="inline-flex items-center gap-1 text-terminal-red">
        <ArrowDownRight className="h-3 w-3" />
        <span className="text-[11px]">{effect}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-terminal-amber">
      <Minus className="h-3 w-3" />
      <span className="text-[11px]">{effect}</span>
    </span>
  )
}

function ShiftIndicator({
  label,
  value,
  colorClass,
  invert,
}: {
  label: string
  value: number
  colorClass: string
  invert?: boolean
}) {
  const dir = invert
    ? (value > 0 ? "LEFT" : value < 0 ? "RIGHT" : "---")
    : (value > 0 ? "RIGHT" : value < 0 ? "LEFT" : "---")
  const percent = Math.min(Math.abs(value) * 30, 100)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-wider text-muted-foreground">{label}</span>
        <span className={`text-[10px] font-bold ${colorClass}`}>{dir}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass.replace("text-", "bg-")}`}
        />
      </div>
    </div>
  )
}

function SignalBadge({ signal, reason }: { signal?: string; reason?: string }) {
  if (!signal || signal === "HOLD") {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-terminal-amber/30 bg-terminal-amber/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-wider text-muted-foreground">AI SIGNAL</span>
          <span className="flex items-center gap-1.5 rounded border border-terminal-amber/40 bg-terminal-amber/10 px-2.5 py-1 text-[11px] font-bold tracking-[0.15em] text-terminal-amber">
            <Activity className="h-3 w-3" />
            HOLD
          </span>
        </div>
        {reason && (
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">{reason}</p>
        )}
      </div>
    )
  }

  if (signal === "BUY") {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-terminal-green/40 bg-terminal-green/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-wider text-muted-foreground">AI SIGNAL</span>
          <span className="flex items-center gap-1.5 rounded border border-terminal-green/50 bg-terminal-green/15 px-2.5 py-1 text-[12px] font-bold tracking-[0.15em] text-terminal-green">
            <TrendingUp className="h-3.5 w-3.5" />
            BUY USD/JPY
          </span>
        </div>
        {reason && (
          <p className="text-[11px] leading-relaxed text-terminal-green/80">{reason}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-terminal-red/40 bg-terminal-red/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-wider text-muted-foreground">AI SIGNAL</span>
        <span className="flex items-center gap-1.5 rounded border border-terminal-red/50 bg-terminal-red/15 px-2.5 py-1 text-[12px] font-bold tracking-[0.15em] text-terminal-red">
          <TrendingDown className="h-3.5 w-3.5" />
          SELL USD/JPY
        </span>
      </div>
      {reason && (
        <p className="text-[11px] leading-relaxed text-terminal-red/80">{reason}</p>
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
      {/* Section Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Brain className="h-4 w-4 text-terminal-cyan" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-foreground">
            AI INSIGHTS
          </span>
          <span className="text-[10px] tracking-wider text-terminal-cyan">{t('ANALYSIS_SUBTITLE')}</span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-terminal-cyan" />
            <span className="text-[10px] tracking-wider text-terminal-cyan">PROCESSING...</span>
          </div>
        )}
      </div>

      {/* Content - スクロール可能・読みやすい余白 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">
          {!result && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-5"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary/30">
                <Sparkles className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[12px] font-bold tracking-wider text-muted-foreground">
                  AWAITING NEWS INPUT
                </span>
                <span className="max-w-[300px] text-center text-[11px] leading-relaxed text-muted-foreground/50">
                  Enter macroeconomic news in the input above to start Mundell-Fleming IS-LM-BP model analysis
                </span>
              </div>
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
                  {/* AI Signal Badge */}
                  <SignalBadge signal={result.signal} reason={result.signal_reason} />

                  {/* Curve Shifts Summary */}
                  <section className="rounded-md border border-border bg-secondary/20 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-terminal-cyan" />
                      <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-cyan">
                        CURVE SHIFTS
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <ShiftIndicator label="IS CURVE" value={shifts.is} colorClass="text-terminal-green" />
                      <ShiftIndicator label="LM CURVE" value={shifts.lm} colorClass="text-terminal-amber" invert />
                      <ShiftIndicator label="BP CURVE" value={shifts.bp} colorClass="text-terminal-cyan" />
                    </div>
                  </section>

                  {/* Macro Effects Grid */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-terminal-amber" />
                      <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-amber">
                        MACRO EFFECTS
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "EXCHANGE RATE", val: me.exchange_rate },
                        { label: "INTEREST RATE", val: me.interest_rate },
                        { label: "OUTPUT", val: me.output },
                        { label: "CAPITAL FLOW", val: me.capital_flow },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex flex-col gap-1 rounded border border-border bg-secondary/20 p-2.5"
                        >
                          <span className="text-[8px] tracking-[0.12em] text-muted-foreground">
                            {item.label}
                          </span>
                          <EffectBadge effect={item.val} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Policy Effectiveness */}
                  <section className="flex items-center justify-between rounded-md border border-border bg-secondary/20 px-4 py-3">
                    <span className="text-[10px] tracking-wider text-muted-foreground">
                      POLICY EFFECTIVENESS
                    </span>
                    <span className="rounded-sm bg-terminal-green/15 px-3 py-1 text-[11px] font-bold tracking-wider text-terminal-green">
                      {(result.policy_effectiveness ?? "—").toUpperCase()}
                    </span>
                  </section>

                  {/* AI Explanation - 読みやすいフォントサイズと余白 */}
                  <section className="rounded-md border border-terminal-cyan/20 bg-terminal-cyan/[0.03] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-terminal-cyan" />
                      <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-cyan">
                        DETAILED ANALYSIS
                      </span>
                    </div>
                    <p className="text-[13px] leading-[1.85] text-foreground/90">
                      {withTooltips(result.logic_jp ?? result.explanation ?? "")}
                    </p>
                    {result.summary && (
                      <div className="mt-5 border-t border-border/40 pt-4">
                        <span className="text-[9px] tracking-wider text-muted-foreground">SUMMARY</span>
                        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/80">
                          {result.summary}
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Regime Info */}
                  <div className="flex items-center justify-end gap-2 text-[9px] text-muted-foreground/40">
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
