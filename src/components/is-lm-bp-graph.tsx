"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion } from "framer-motion"
import type { ShiftState } from "@/lib/types"

interface Props {
  shifts: ShiftState
  isAnimating: boolean
}

const COLORS = {
  is: "#22c55e",
  lm: "#eab308",
  bp: "#06b6d4",
  isDim: "rgba(34,197,94,0.2)",
  lmDim: "rgba(234,179,8,0.2)",
  bpDim: "rgba(6,182,212,0.2)",
  grid: "rgba(148,163,184,0.08)",
  axis: "rgba(148,163,184,0.25)",
  text: "rgba(148,163,184,0.5)",
  dot: "#ffffff",
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function ISLMBPGraph({ shifts, isAnimating }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const currentShifts = useRef({ is: 0, lm: 0, bp: 0 })
  const targetShifts = useRef({ is: 0, lm: 0, bp: 0 })
  const animStartTime = useRef<number>(0)
  const animStartShifts = useRef({ is: 0, lm: 0, bp: 0 })
  const [size, setSize] = useState({ w: 600, h: 450 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size.w * 2
    canvas.height = size.h * 2
    canvas.style.width = `${size.w}px`
    canvas.style.height = `${size.h}px`
  }, [size])

  // kick off animation when shifts change
  useEffect(() => {
    animStartShifts.current = { ...currentShifts.current }
    targetShifts.current = { ...shifts }
    animStartTime.current = performance.now()
  }, [shifts])

  const drawCurve = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      type: "is" | "lm" | "bp",
      shift: number,
      pad: { l: number; t: number; r: number; b: number },
      gw: number,
      gh: number,
      isDim: boolean
    ) => {
      const SHIFT_PX = shift * gw * 0.12
      ctx.beginPath()
      ctx.lineWidth = isDim ? 1.5 : 3
      ctx.strokeStyle = isDim
        ? COLORS[`${type}Dim` as keyof typeof COLORS]
        : COLORS[type]

      if (!isDim) {
        ctx.shadowColor = COLORS[type]
        ctx.shadowBlur = 12
      }

      const steps = 80
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        let x: number, y: number

        if (type === "is") {
          // IS: downward sloping  r = f(Y)
          x = pad.l + t * gw + SHIFT_PX
          y = pad.t + (1 - (1 - t * 0.85 - 0.075)) * gh
        } else if (type === "lm") {
          // LM: upward sloping
          x = pad.l + t * gw + SHIFT_PX
          y = pad.t + (1 - (t * 0.85 + 0.075)) * gh
        } else {
          // BP: relatively flat / upward (depends on capital mobility)
          x = pad.l + t * gw
          y = pad.t + (1 - (0.35 + t * 0.3 + shift * 0.12)) * gh
        }

        x = Math.max(pad.l, Math.min(pad.l + gw, x))
        y = Math.max(pad.t, Math.min(pad.t + gh, y))

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Label
      if (!isDim) {
        const labelMap = { is: "IS", lm: "LM", bp: "BP" }
        const endT = 0.92
        let lx: number, ly: number

        if (type === "is") {
          lx = pad.l + endT * gw + SHIFT_PX
          ly = pad.t + (1 - (1 - endT * 0.85 - 0.075)) * gh - 14
        } else if (type === "lm") {
          lx = pad.l + endT * gw + SHIFT_PX
          ly = pad.t + (1 - (endT * 0.85 + 0.075)) * gh - 14
        } else {
          lx = pad.l + endT * gw
          ly = pad.t + (1 - (0.35 + endT * 0.3 + shift * 0.12)) * gh - 14
        }

        ctx.font = "bold 24px 'JetBrains Mono', monospace"
        ctx.fillStyle = COLORS[type]
        ctx.textAlign = "center"
        ctx.fillText(labelMap[type], lx, ly)
      }
    },
    []
  )

  const findEquilibrium = useCallback(
    (
      isShift: number,
      lmShift: number,
      pad: { l: number; t: number; r: number; b: number },
      gw: number,
      gh: number
    ) => {
      // IS: y = pad.t + (1 - (1 - t*0.85 - 0.075))*gh,  x = pad.l + t*gw + SHIFT_PX_is
      // LM: y = pad.t + (1 - (t*0.85 + 0.075))*gh,       x = pad.l + t*gw + SHIFT_PX_lm
      // At intersection: IS_y(t1) = LM_y(t2) and IS_x(t1) = LM_x(t2)
      // IS_y = pad.t + (t1*0.85+0.075)*gh
      // LM_y = pad.t + (1 - t2*0.85 - 0.075)*gh
      // set equal => t1*0.85+0.075 = 1-t2*0.85-0.075 => t1*0.85 + t2*0.85 = 0.85 => t1+t2=1
      // IS_x = LM_x => pad.l + t1*gw + isShift*gw*0.12 = pad.l + t2*gw + lmShift*gw*0.12
      // => t1 + isShift*0.12 = t2 + lmShift*0.12
      // => t1 - t2 = (lmShift - isShift)*0.12
      // t1+t2=1, t1-t2=(lmShift-isShift)*0.12
      // t1 = (1 + (lmShift-isShift)*0.12)/2
      const t1 = (1 + (lmShift - isShift) * 0.12) / 2
      const t1c = Math.max(0.05, Math.min(0.95, t1))
      const x = pad.l + t1c * gw + isShift * gw * 0.12
      const y = pad.t + (t1c * 0.85 + 0.075) * gh
      return { x: Math.max(pad.l, Math.min(pad.l + gw, x)), y: Math.max(pad.t, Math.min(pad.t + gh, y)) }
    },
    []
  )

  const draw = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = 2
      const W = size.w * dpr
      const H = size.h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Animate
      const elapsed = time - animStartTime.current
      const duration = 900
      const progress = Math.min(elapsed / duration, 1)
      const ease = easeOutCubic(progress)

      currentShifts.current = {
        is: lerp(animStartShifts.current.is, targetShifts.current.is, ease),
        lm: lerp(animStartShifts.current.lm, targetShifts.current.lm, ease),
        bp: lerp(animStartShifts.current.bp, targetShifts.current.bp, ease),
      }

      const w = W / dpr
      const h = H / dpr
      const pad = { l: 60, t: 30, r: 30, b: 50 }
      const gw = w - pad.l - pad.r
      const gh = h - pad.t - pad.b

      // Clear
      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = COLORS.grid
      ctx.lineWidth = 1
      for (let i = 0; i <= 8; i++) {
        const y = pad.t + (i / 8) * gh
        ctx.beginPath()
        ctx.moveTo(pad.l, y)
        ctx.lineTo(pad.l + gw, y)
        ctx.stroke()
      }
      for (let i = 0; i <= 8; i++) {
        const x = pad.l + (i / 8) * gw
        ctx.beginPath()
        ctx.moveTo(x, pad.t)
        ctx.lineTo(x, pad.t + gh)
        ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = COLORS.axis
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(pad.l, pad.t)
      ctx.lineTo(pad.l, pad.t + gh)
      ctx.lineTo(pad.l + gw, pad.t + gh)
      ctx.stroke()

      // Axis labels
      ctx.fillStyle = COLORS.text
      ctx.font = "13px 'JetBrains Mono', monospace"
      ctx.textAlign = "center"
      ctx.fillText("Y (Output / Income)", pad.l + gw / 2, pad.t + gh + 40)
      ctx.save()
      ctx.translate(18, pad.t + gh / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText("r (Interest Rate)", 0, 0)
      ctx.restore()

      const cs = currentShifts.current
      const hasShifted = cs.is !== 0 || cs.lm !== 0 || cs.bp !== 0

      // Baseline dim curves
      if (hasShifted) {
        ctx.setLineDash([6, 6])
        drawCurve(ctx, "is", 0, pad, gw, gh, true)
        drawCurve(ctx, "lm", 0, pad, gw, gh, true)
        drawCurve(ctx, "bp", 0, pad, gw, gh, true)
        ctx.setLineDash([])
      }

      // Active curves
      drawCurve(ctx, "bp", cs.bp, pad, gw, gh, false)
      drawCurve(ctx, "lm", cs.lm, pad, gw, gh, false)
      drawCurve(ctx, "is", cs.is, pad, gw, gh, false)

      // Equilibrium dot
      const eq = findEquilibrium(cs.is, cs.lm, pad, gw, gh)
      // Dashed lines
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = "rgba(255,255,255,0.2)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(eq.x, eq.y)
      ctx.lineTo(eq.x, pad.t + gh)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(eq.x, eq.y)
      ctx.lineTo(pad.l, eq.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Pulsing glow
      const pulse = 0.5 + 0.5 * Math.sin(time / 400)
      ctx.beginPath()
      ctx.arc(eq.x, eq.y, 10 + pulse * 6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${0.04 + pulse * 0.04})`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(eq.x, eq.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.dot
      ctx.shadowColor = COLORS.dot
      ctx.shadowBlur = 16
      ctx.fill()
      ctx.shadowBlur = 0

      // Labels at axes
      ctx.font = "bold 12px 'JetBrains Mono', monospace"
      ctx.fillStyle = "#22c55e"
      ctx.textAlign = "center"
      ctx.fillText("Y*", eq.x, pad.t + gh + 18)
      ctx.textAlign = "right"
      ctx.fillText("r*", pad.l - 10, eq.y + 4)

      // Shift arrows
      if (hasShifted) {
        const arrowCurves: { type: "is" | "lm" | "bp"; val: number }[] = [
          { type: "is", val: cs.is },
          { type: "lm", val: cs.lm },
          { type: "bp", val: cs.bp },
        ]
        for (const ac of arrowCurves) {
          if (Math.abs(ac.val) < 0.05) continue
          const midT = 0.5
          let baseX: number, baseY: number
          if (ac.type === "is") {
            baseX = pad.l + midT * gw
            baseY = pad.t + (midT * 0.85 + 0.075) * gh
          } else if (ac.type === "lm") {
            baseX = pad.l + midT * gw
            baseY = pad.t + (1 - midT * 0.85 - 0.075) * gh
          } else {
            baseX = pad.l + midT * gw
            baseY = pad.t + (1 - (0.35 + midT * 0.3)) * gh
          }
          const dir = ac.val > 0 ? 1 : -1
          const arrowLen = 24
          ctx.strokeStyle = COLORS[ac.type]
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(baseX, baseY)
          ctx.lineTo(baseX + dir * arrowLen, baseY)
          ctx.stroke()
          // Arrow head
          ctx.beginPath()
          ctx.moveTo(baseX + dir * arrowLen, baseY)
          ctx.lineTo(baseX + dir * (arrowLen - 6), baseY - 4)
          ctx.lineTo(baseX + dir * (arrowLen - 6), baseY + 4)
          ctx.closePath()
          ctx.fillStyle = COLORS[ac.type]
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(draw)
    },
    [size, drawCurve, findEquilibrium]
  )

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <div ref={containerRef} className="relative h-full w-full min-h-[300px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
      />
      {/* Analyzing overlay */}
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-4 top-4 flex items-center gap-2"
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
      {/* Legend */}
      <div className="absolute right-4 top-4 flex items-center gap-4">
        {[
          { label: "IS", color: "bg-[#22c55e]" },
          { label: "LM", color: "bg-[#eab308]" },
          { label: "BP", color: "bg-[#06b6d4]" },
        ].map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <span className={`h-0.5 w-4 rounded-full ${c.color}`} />
            <span className="text-[10px] text-muted-foreground">{c.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
