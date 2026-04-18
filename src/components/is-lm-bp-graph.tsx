"use client"

import { useMemo, useState, useEffect, JSX } from "react"
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
// X/Y軸ラベルのみ Label 使用、曲線ラベルは Customized で SVG 描画
import type { ShiftState } from "@/lib/types"

const ARROW_COLOR = "#00FF00"
const ARROW_STROKE = 2
const LABEL_COLOR = "rgba(226,232,240,0.95)"
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

const CURVE_TOOLTIPS: Record<string, string> = {
  IS: "財市場の均衡（投資＝貯蓄）。右シフト → 財政拡張・輸出増加。左シフト → 財政緊縮・輸入増加。",
  LM: "貨幣市場の均衡（流動性選好＝貨幣供給）。左シフト → 金融引き締め・利上げ。右シフト → 金融緩和・利下げ。",
  BP: "国際収支の均衡。上シフト → 資本流入（円高方向）。下シフト → 資本流出（円安方向）。",
  "E₀": "現在の均衡点（産出量Y、金利r）。ニュース入力前の状態。",
  "E₁": "ニュース分析後の予測均衡点。曲線シフトにより移動した新しい均衡。",
}

interface TooltipState {
  label: string
  desc: string
  x: number
  y: number
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

const ARROW_MARKER_ID = "islmbp-arrow-marker"
const LABEL_X_OFFSET = 12

function ChartOverlay({
  chartProps,
  data,
  e0,
  e1,
  hasPrediction,
  isShifting,
  onHover,
}: {
  chartProps: Record<string, unknown>
  data: { y: number; rIS: number; rLM: number; rBP: number; rIS0?: number; rLM0?: number; rBP0?: number }[]
  e0: { y: number; r: number } | null
  e1: { y: number; r: number }
  hasPrediction: boolean
  isShifting: boolean
  onHover: (t: TooltipState | null) => void
}) {
  const xAxisMap = chartProps.xAxisMap as Record<string, { scale: (v: number) => number }> | undefined
  const yAxisMap = chartProps.yAxisMap as Record<string, { scale: (v: number) => number }> | undefined
  const offset = chartProps.offset as { left?: number; top?: number } | undefined
  if (!xAxisMap || !yAxisMap || !offset || !data.length) return null

  const xScale = Object.values(xAxisMap)[0]?.scale
  const yScale = Object.values(yAxisMap)[0]?.scale
  if (!xScale || !yScale) return null

  const left = offset.left ?? 0
  const top = offset.top ?? 0
  const last = data[data.length - 1]
  const xRight = left + xScale(100)
  const rIS = last.rIS0 ?? last.rIS
  const rLM = last.rLM0 ?? last.rLM
  const rBP = last.rBP0 ?? last.rBP

  const yIS = top + yScale(rIS)
  const yLM = top + yScale(rLM)
  const yBP = top + yScale(rBP)

  const elements: JSX.Element[] = []

  // 1. 右端ラベル（IS: -15px, BP: 0, LM: +15px）
  const curveLabels: { key: string; x: number; y: number; fill: string }[] = [
    { key: "IS", x: xRight + LABEL_X_OFFSET, y: yIS - 15, fill: COLORS.is },
    { key: "BP", x: xRight + LABEL_X_OFFSET, y: yBP,      fill: COLORS.bp },
    { key: "LM", x: xRight + LABEL_X_OFFSET, y: yLM + 15, fill: COLORS.lm },
  ]
  curveLabels.forEach(({ key, x, y, fill }) => {
    elements.push(
      <text
        key={key}
        x={x}
        y={y}
        fill={fill}
        fontSize={12}
        fontWeight="bold"
        style={{ pointerEvents: "all", cursor: "pointer" }}
        onMouseEnter={() => onHover({ label: key, desc: CURVE_TOOLTIPS[key] ?? "", x, y })}
        onMouseLeave={() => onHover(null)}
      >
        {key}
      </text>
    )
  })

  // 2. 矢印（isShifting のときのみ E0→E1）
  if (isShifting && e0 && e1 && (e0.y !== e1.y || e0.r !== e1.r)) {
    const x0 = left + xScale(e0.y)
    const y0 = top + yScale(e0.r)
    const x1 = left + xScale(e1.y)
    const y1 = top + yScale(e1.r)
    elements.push(
      <defs key="defs">
        <marker
          id={ARROW_MARKER_ID}
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={5}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill={ARROW_COLOR} stroke="#ffffff" strokeWidth="0.5" />
        </marker>
      </defs>,
      <line
        key="arrow"
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={ARROW_COLOR}
        strokeWidth={ARROW_STROKE}
        markerEnd={`url(#${ARROW_MARKER_ID})`}
        style={{ pointerEvents: "none" }}
      />
    )
  }

  // 3. E0 / E1 ラベル（斜め上にオフセット）
  if (hasPrediction && e0) {
    const x = left + xScale(e0.y)
    const y = top + yScale(e0.r)
    elements.push(
      <text
        key="e0"
        x={x - 18}
        y={y - 18}
        fill={LABEL_COLOR}
        fontSize={12}
        fontWeight="bold"
        style={{ pointerEvents: "all", cursor: "pointer" }}
        onMouseEnter={() => onHover({ label: "E₀", desc: CURVE_TOOLTIPS["E₀"] ?? "", x: x - 18, y: y - 18 })}
        onMouseLeave={() => onHover(null)}
      >
        E₀
      </text>
    )
  }
  if (hasPrediction && e1) {
    const x = left + xScale(e1.y)
    const y = top + yScale(e1.r)
    elements.push(
      <text
        key="e1"
        x={x + 18}
        y={y - 18}
        fill={LABEL_COLOR}
        fontSize={12}
        fontWeight="bold"
        style={{ pointerEvents: "all", cursor: "pointer" }}
        onMouseEnter={() => onHover({ label: "E₁", desc: CURVE_TOOLTIPS["E₁"] ?? "", x: x + 18, y: y - 18 })}
        onMouseLeave={() => onHover(null)}
      >
        E₁
      </text>
    )
  }

  return <g>{elements}</g>
}

export function ISLMBPGraph({ shifts, isAnimating, analysisResult }: Props) {
  const hasPrediction = analysisResult != null

  const { data, eq } = useMemo(
    () => buildCurves(shifts, hasPrediction),
    [shifts, hasPrediction]
  )

  const [arrowVisible, setArrowVisible] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

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
          margin={{ top: 40, right: 80, left: 60, bottom: 75 }}
        >
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="y"
            type="number"
            domain={[0, 100]}
            tick={{ fill: COLORS.text, fontSize: 10 }}
            tickMargin={10}
          >
            <Label
              value="Y (Output / Income)"
              position="insideBottom"
              offset={0}
              dy={32}
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
              />
              <Line
                type="monotone"
                dataKey="rLM0"
                name="LM (現在)"
                stroke={COLORS.lm}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="rIS0"
                name="IS (現在)"
                stroke={COLORS.is}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
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
              />
              <Line
                type="monotone"
                dataKey="rLM"
                name="LM"
                stroke={COLORS.lm}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
              />
              <Line
                type="monotone"
                dataKey="rIS"
                name="IS"
                stroke={COLORS.is}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
              />
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

          {/* 曲線ラベル・矢印・均衡点ラベル（Customized で SVG 直接描画） */}
          <Customized
            component={(p: Record<string, unknown>) => (
              <ChartOverlay
                chartProps={p}
                data={data}
                e0={e0 ?? null}
                e1={e1}
                hasPrediction={hasPrediction}
                isShifting={arrowVisible}
                onHover={setTooltip}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* ホバーツールチップ */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 max-w-[220px] rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 shadow-xl"
          style={{ left: tooltip.x + 12, top: Math.max(4, tooltip.y - 50) }}
        >
          <p className="mb-1 text-[10px] font-bold tracking-wider text-white/90">{tooltip.label}</p>
          <p className="text-[10px] leading-relaxed text-white/55">{tooltip.desc}</p>
        </div>
      )}

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

    </div>
  )
}
