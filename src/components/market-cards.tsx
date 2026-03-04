"use client"

import { motion } from "framer-motion"
import { DollarSign, Percent, BarChart3 } from "lucide-react"

interface Props {
  fxRate?: number | string
  usInterestRate?: number | string
  cpi?: number | string
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

function Card({
  label,
  value,
  icon: Icon,
  accentClass,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  accentClass: string
}) {
  return (
    <motion.div
      variants={item}
      className="flex flex-col gap-1.5 rounded border border-border bg-background/60 px-3 py-2.5"
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${accentClass}`} />
        <span className="text-[9px] tracking-[0.15em] text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-bold tabular-nums leading-none ${accentClass}`}>
        {value}
      </span>
    </motion.div>
  )
}

export function MarketCards({ fxRate, usInterestRate, cpi }: Props) {
  const format = (v: number | string | undefined) =>
    v == null || v === "" ? "---" : typeof v === "number" ? v.toFixed(2) : String(v)

  const cards = [
    {
      label: "USD/JPY",
      value: format(fxRate),
      icon: DollarSign,
      accentClass: "text-terminal-green",
    },
    {
      label: "US INTEREST RATE",
      value: format(usInterestRate),
      icon: Percent,
      accentClass: "text-terminal-amber",
    },
    {
      label: "CPI (YoY)",
      value: format(cpi),
      icon: BarChart3,
      accentClass: "text-terminal-cyan",
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-2"
    >
      {cards.map((c) => (
        <Card key={c.label} {...c} />
      ))}
    </motion.div>
  )
}
