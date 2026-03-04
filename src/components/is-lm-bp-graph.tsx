"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts"
import type { ShiftState } from "@/lib/types"

interface Props {
  shifts: ShiftState
  isAnimating: boolean
}

const COLORS = {
  is: "#22c55e",
  lm: "#eab308",
  bp: "#06b6d4",
  grid: "rgba(148,163,184,0.12)",
  axis: "rgba(148,163,184,0.7)",
  text: "rgba(226,232,240,0.9)",
}

type Point = { y: number; rIS: number; rLM: number; rBP: number }

function buildCurves(shifts: ShiftState): { data: Point[]; eq: { y: number; r: number } } {
  const { is, lm, bp } = shifts
  const baseYs = [0, 20, 40, 60, 80, 100]

  const data: Point[] = baseYs.map((y) => {
    const rIS = 7 - 0.05 * y + is * 0.7
    const rLM = 3 + 0.05 * y + lm * 0.7
    const rBP = 4 + 0.015 * y + bp * 0.5
    return { y, rIS, rLM, rBP }
  })

  // 7 - 0.05Y + is*0.7 = 3 + 0.05Y + lm*0.7
  let yEq = (4 + 0.7 * (is - lm)) / 0.1
  yEq = Math.max(0, Math.min(100, yEq))
  const rEq = 7 - 0.05 * yEq + is * 0.7

  return { data, eq: { y: yEq, r: rEq } }
}

export function ISLMBPGraph({ shifts, isAnimating }: Props) {
  const { data, eq } = useMemo(() => buildCurves(shifts), [shifts])

  return (
    <div className="relative h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 40, right: 60, left: 60, bottom: 60 }}
        >
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="y"
            type="number"
            domain={[0, 100]}
            tick={{ fill: COLORS.text, fontSize: 10 }}
          >
            <Label
              value="Y (Output / Income)"
              position="insideBottom"
              offset={25}
              dy={10}
              fill={COLORS.text}
              style={{ fontSize: 11, fontWeight: "bold" }}
            />
          </XAxis>
          <YAxis
            type="number"
            domain={[0, 10]}
            tick={{ fill: COLORS.text, fontSize: 10 }}
            axisLine={{ stroke: COLORS.axis }}
            tickLine={{ stroke: COLORS.axis }}
          >
            <Label
              value="r (Interest Rate)"
              angle={-90}
              position="insideLeft"
              offset={30}
              dx={-10}
              fill={COLORS.text}
              style={{ fontSize: 11, fontWeight: "bold" }}
            />
          </YAxis>
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(148,163,184,0.4)",
              borderRadius: 6,
              fontSize: 11,
            }}
            labelFormatter={(value) => `Y = ${value.toFixed(1)}`}
            formatter={(val, name) => [`${(val as number).toFixed(2)}`, name]}
          />

          <Line
            type="monotone"
            dataKey="rBP"
            name="BP"
            stroke={COLORS.bp}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
          >
            <Label
              value="BP"
              position="right"
              offset={12}
              dy={-10}
              fill={COLORS.bp}
              style={{ fontSize: 11, fontWeight: "bold" }}
            />
          </Line>

          <Line
            type="monotone"
            dataKey="rLM"
            name="LM"
            stroke={COLORS.lm}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
          >
            <Label
              value="LM"
              position="right"
              offset={12}
              dy={-10}
              fill={COLORS.lm}
              style={{ fontSize: 11, fontWeight: "bold" }}
            />
          </Line>

          <Line
            type="monotone"
            dataKey="rIS"
            name="IS"
            stroke={COLORS.is}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
          >
            <Label
              value="IS"
              position="right"
              offset={12}
              dy={-10}
              fill={COLORS.is}
              style={{ fontSize: 11, fontWeight: "bold" }}
            />
          </Line>

          <ReferenceDot
            x={eq.y}
            y={eq.r}
            r={5}
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>

      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute left-4 top-4 flex items-center gap-2"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terminal-green opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terminal-green" />
          </span>
          <span className="text-[11px] font-bold tracking-widest text-terminal-green">
            ANALYZING...
          </span>
        </motion.div>
      )}

      <div className="pointer-events-none absolute left-4 bottom-4 rounded-md border border-border/90 bg-background/90 px-3 py-1.5 shadow-sm">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
          AI 分析 (Gemini)
        </span>
      </div>
    </div>
  )
}
