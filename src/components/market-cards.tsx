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

const CARDS = [
  {
    label: "USD/JPY",
    icon: DollarSign,
    color: "rgba(0,255,128,0.8)",
    borderColor: "rgba(0,255,128,0.15)",
    bgColor: "rgba(0,255,128,0.04)",
  },
  {
    label: "US INTEREST RATE",
    icon: Percent,
    color: "rgba(220,180,60,0.9)",
    borderColor: "rgba(220,180,60,0.15)",
    bgColor: "rgba(220,180,60,0.04)",
  },
  {
    label: "CPI (YoY)",
    icon: BarChart3,
    color: "rgba(0,210,230,0.8)",
    borderColor: "rgba(0,210,230,0.15)",
    bgColor: "rgba(0,210,230,0.04)",
  },
]

export function MarketCards({ fxRate, usInterestRate, cpi }: Props) {
  const format = (v: number | string | undefined) =>
    v == null || v === "" ? "---" : typeof v === "number" ? v.toFixed(2) : String(v)

  const values = [format(fxRate), format(usInterestRate), format(cpi)]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-2"
    >
      {CARDS.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            variants={item}
            className="flex flex-col gap-1.5 rounded-xl px-3 py-2.5"
            style={{
              border: `1px solid ${card.borderColor}`,
              background: card.bgColor,
            }}
          >
            <div className="flex items-center gap-1.5">
              <Icon className="h-3 w-3" style={{ color: card.color }} />
              <span className="text-[9px] tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {card.label}
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums leading-none" style={{ color: card.color }}>
              {values[i]}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
