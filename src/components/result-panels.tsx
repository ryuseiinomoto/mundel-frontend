"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  TrendingDown,
  Brain,
  ChevronRight,
  Shield,
} from "lucide-react"
import type { AnalysisResult, ShiftState } from "@/lib/types"

function EffectBadge({ effect }: { effect: string | undefined }) {
  if (!effect) return <span className="text-[11px] text-muted-foreground">—</span>
  const n = effect.toLowerCase()
  const isUp =
    n.includes("increase") || n.includes("up") || n.includes("appreciation") || n.includes("expand") || n.includes("inflow")
  const isDown =
    n.includes("decrease") || n.includes("down") || n.includes("depreciation") || n.includes("contract") || n.includes("outflow")

  if (isUp) {
    return (
      <span className="inline-flex items-center gap-1 text-terminal-green">
        <ArrowUpRight className="h-3.5 w-3.5" />
        <span className="text-[11px]">{effect}</span>
      </span>
    )
  }
  if (isDown) {
    return (
      <span className="inline-flex items-center gap-1 text-terminal-red">
        <ArrowDownRight className="h-3.5 w-3.5" />
        <span className="text-[11px]">{effect}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-terminal-amber">
      <Minus className="h-3.5 w-3.5" />
      <span className="text-[11px]">{effect}</span>
    </span>
  )
}

function ShiftBar({
  label,
  value,
  colorClass,
  delay,
}: {
  label: string
  value: number
  colorClass: string
  delay: number
}) {
  const percent = Math.min(Math.abs(value) * 25, 100)
  const dir = value > 0 ? "RIGHT" : value < 0 ? "LEFT" : "---"

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.12em] text-muted-foreground">{label}</span>
        <span className={`text-[10px] font-bold ${colorClass}`}>
          {dir}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass.replace("text-", "bg-")}`}
        />
      </div>
    </motion.div>
  )
}

interface Props {
  result: AnalysisResult | null
  shifts: ShiftState
}

export function ResultPanels({ result, shifts }: Props) {
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] tracking-wider text-muted-foreground">
            AWAITING INPUT
          </span>
          <span className="max-w-[220px] text-[10px] leading-relaxed text-muted-foreground/50">
            Enter macroeconomic news on the left panel to start IS-LM-BP analysis
          </span>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="result"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4"
      >
        {/* Curve Shifts */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-terminal-cyan" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-cyan">
              CURVE SHIFTS
            </span>
          </div>
          <div className="flex flex-col gap-2.5 rounded border border-border bg-background/50 p-3">
            <ShiftBar label="IS CURVE" value={shifts.is} colorClass="text-terminal-green" delay={0} />
            <ShiftBar label="LM CURVE" value={shifts.lm} colorClass="text-terminal-amber" delay={0.08} />
            <ShiftBar label="BP CURVE" value={shifts.bp} colorClass="text-terminal-cyan" delay={0.16} />
          </div>
        </section>

        {/* Macro Effects - shown when API returns these fields */}
        {([result.exchange_rate_effect, result.interest_rate_effect, result.output_effect, result.capital_flow].some(Boolean) && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-terminal-amber" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-amber">
              MACRO EFFECTS
            </span>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 gap-2"
          >
            {[
              { label: "EXCHANGE RATE", val: result.exchange_rate_effect },
              { label: "INTEREST RATE", val: result.interest_rate_effect },
              { label: "OUTPUT", val: result.output_effect },
              { label: "CAPITAL FLOW", val: result.capital_flow },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className="flex flex-col gap-1 rounded border border-border bg-background/50 p-2.5"
              >
                <span className="text-[8px] tracking-[0.12em] text-muted-foreground">
                  {item.label}
                </span>
                <EffectBadge effect={item.val} />
              </motion.div>
            ))}
          </motion.div>
        </section>
        ))}

        {/* Policy Effectiveness - shown when API returns this field */}
        {result.policy_effectiveness && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-terminal-green" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-green">
              POLICY ASSESSMENT
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded border border-border bg-background/50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground">EFFECTIVENESS</span>
              <span className="rounded bg-terminal-green/10 px-2 py-0.5 text-[11px] font-bold text-terminal-green">
                {result.policy_effectiveness.toUpperCase()}
              </span>
            </div>
          </motion.div>
        </section>
        )}

        {/* AI Explanation (logic_jp from API) */}
        {(result.logic_jp ?? result.explanation) && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-terminal-amber" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-terminal-amber">
              AI ANALYSIS
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded border border-terminal-green/20 bg-terminal-green/[0.03] p-3"
          >
            <p className="text-[11px] leading-[1.8] text-foreground/85">
              {result.logic_jp ?? result.explanation}
            </p>
            {result.summary && (
              <p className="mt-3 border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
            )}
          </motion.div>
        </section>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
