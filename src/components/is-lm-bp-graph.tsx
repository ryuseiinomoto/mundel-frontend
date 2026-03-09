"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CartesianGrid,
  Customized,
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

const ARROW_COLOR = "#ffaa00"
const COLORS = {
  is: "#22c55e",
  lm: "#eab308",
  bp: "#06b6d4",
  isDim: "rgba(34,197,94,0.35)",
  lmDim: "rgba(234,179,8,0.35)",
  bpDim: "rgba(6,182,212,0.35)",
  grid: "rgba(148,163,184,0.12)",
  axis: "rgba(148,163,184,0.7)",
  text: "rgba(226,232,240,0.9)",
}

interface AnalysisResult {
  is_shift: number
  lm_shift: number
  bp_shift: number
  equilibrium_e0: { y: number; r: number }
  predicted_equilibrium: { y: number; r: number }
}

interface Props {
  shifts: ShiftState
  isAnimating: boolean
  analysisResult?: AnalysisResult | null
}

type Point = {
  y: number
  rIS: number
  rLM: number
  rBP: number
  rIS0?: number
  rLM0?: number
  rBP0?: number
}

function buildCurves(
  shifts: ShiftState,
  includeBaseline: boolean
): { data: Point[]; eq: { y: number; r: number } } {
  const { is, lm, bp } = shifts
  const baseYs = [0, 20, 40, 60, 80, 100]

  const data: Point[] = baseYs.map((y) => {
    const rIS = 7 - 0.05 * y + is * 0.7
    const rLM = 3 + 0.05 * y + lm * 0.7
    const rBP = 4 + 0.015 * y + bp * 0.5
    const pt: Point = { y, rIS, rLM, rBP }
    if (includeBaseline) {
      pt.rIS0 = 7 - 0.05 * y
      pt.rLM0 = 3 + 0.05 * y
      pt.rBP0 = 4 + 0.015 * y
    }
    return pt
  })

  let yEq = (4 + 0.7 * (is - lm)) / 0.1
  yEq = Math.max(0, Math.min(100, yEq))
  const rEq = 7 - 0.05 * yEq + is * 0.7

  return { data, eq: { y: yEq, r: rEq } }
}

function PredictionArrow({
  props: chartProps,
  e0,
  e1,
  isVisible,
}: {
  props: Record<string, unknown>
  e0: { y: number; r: number }
  e1: { y: number; r: number }
  isVisible: boolean
}) {
  const xAxisMap = chartProps.xAxisMap as Record<string, { scale: (v: number) => number }> | undefined
  const yAxisMap = chartProps.yAxisMap as Record<string, { scale: (v: number) => number }> | undefined
  const offset = chartProps.offset as { left?: number; top?: number } | undefined

  if (
    !isVisible ||
    !xAxisMap ||
    !yAxisMap ||
    !offset ||
    !e0 ||
    !e1 ||
    (e0.y === e1.y && e0.r === e1.r)
  ) {
    return null
  }

  const xScale = Object.values(xAxisMap)[0]?.scale
  const yScale = Object.values(yAxisMap)[0]?.scale
  if (!xScale || !yScale) return null

  const left = offset.left ?? 0
  const top = offset.top ?? 0
  const x0 = left + xScale(e0.y)
  const y0 = top + yScale(e0.r)
  const x1 = left + xScale(e1.y)
  const y1 = top + yScale(e1.r)

  const len = Math.hypot(x1 - x0, y1 - y0)
  const markerId = "arrow-marker-prediction"
  return (
    <g>
      <defs>
        <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id={markerId}
          markerWidth={12}
          markerHeight={12}
          refX={10}
          refY={6}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0,0 L12,6 L0,12 Z"
            fill={ARROW_COLOR}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.5"
            style={{ filter: "url(#arrow-glow)" }}
          />
        </marker>
      </defs>
      <motion.line
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={ARROW_COLOR}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={len}
        markerEnd={`url(#${markerId})`}
        style={{ filter: "url(#arrow-glow)" }}
        initial={{ strokeDashoffset: len, opacity: 0.6 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </g>
  )
}

export function ISLMBPGraph({ shifts, isAnimating, analysisResult }: Props) {
  const hasPrediction = analysisResult != null

  const { data, eq } = useMemo(
    () => buildCurves(shifts, hasPrediction),
    [shifts, hasPrediction]
  )

  const [arrowVisible, setArrowVisible] = useState(false)
  useEffect(() => {
    if (hasPrediction && !isAnimating) {
      const t = setTimeout(() => setArrowVisible(true), 100)
      return () => clearTimeout(t)
    } else {
      setArrowVisible(false)
    }
  }, [hasPrediction, isAnimating])

  const e0 = analysisResult?.equilibrium_e0
  const e1 = analysisResult?.predicted_equilibrium ?? eq

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

          {/* 現在の曲線（実線）IS, LM, BP - 予測時は r*0、なければ r* */}
          {hasPrediction && data[0]?.rIS0 != null ? (
            <>
              <Line
                type="monotone"
                dataKey="rBP0"
                name="BP (現在)"
                stroke={COLORS.bp}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
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
                dataKey="rLM0"
                name="LM (現在)"
                stroke={COLORS.lm}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
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
                dataKey="rIS0"
                name="IS (現在)"
                stroke={COLORS.is}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
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
            </>
          ) : (
            <>
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
            </>
          )}

          {/* 予測曲線（点線・半透明）IS', LM', BP' */}
          {hasPrediction && (
            <>
              <Line
                type="monotone"
                dataKey="rBP"
                name="BP'"
                stroke={COLORS.bpDim}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="rLM"
                name="LM'"
                stroke={COLORS.lmDim}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="rIS"
                name="IS'"
                stroke={COLORS.isDim}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            </>
          )}

          {/* E0（現在の均衡点） */}
          {hasPrediction && e0 && (
            <ReferenceDot
              x={e0.y}
              y={e0.r}
              r={4}
              fill="rgba(255,255,255,0.6)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth={1}
            />
          )}

          {/* E1（予測均衡点） */}
          <ReferenceDot
            x={e1.y}
            y={e1.r}
            r={5}
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth={1.5}
          />

          {/* 予測矢印 E0 → E1 */}
          <Customized
            component={(p: Record<string, unknown>) => (
              <PredictionArrow
                props={p}
                e0={e0 ?? { y: 40, r: 5 }}
                e1={e1}
                isVisible={arrowVisible}
              />
            )}
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
