"use client"

import { useState, useRef } from "react"
import { createPortal } from "react-dom"

const TERM_DEFINITIONS: Record<string, string> = {
  "IS曲線": "財市場の均衡を示す曲線。投資(I)＝貯蓄(S)。右シフト=財政拡張・輸出増加。左シフト=財政緊縮・輸入増加。",
  "LM曲線": "貨幣市場の均衡を示す曲線。流動性選好(L)＝貨幣供給(M)。左シフト=金融引き締め・利上げ。右シフト=金融緩和・利下げ。",
  "BP曲線": "国際収支の均衡を示す曲線。上シフト=資本流入・通貨高圧力。下シフト=資本流出・通貨安圧力。",
  "マンデル＝フレミング": "開放経済における財・貨幣・国際収支の同時均衡を分析するモデル。IS-LM-BPの3曲線で構成。",
  "マンデル=フレミング": "開放経済における財・貨幣・国際収支の同時均衡を分析するモデル。IS-LM-BPの3曲線で構成。",
  "均衡点": "IS曲線とLM曲線が交差する点。財市場と貨幣市場が同時に均衡する所得(Y)と利子率(r)の組み合わせ。",
  "資本フロー": "国境を越えた資本の移動。高金利国への流入（資本流入）や低金利国からの流出（資本流出）が起こる。",
  "財政政策": "政府支出・税収の変更によるIS曲線のシフト。固定相場制では有効、変動相場制では非有効（マンデル＝フレミング定理）。",
  "金融政策": "中央銀行による利子率・マネーサプライの操作によるLM曲線のシフト。変動相場制では有効、固定相場制では非有効。",
  "変動相場制": "為替レートが市場の需給で決まる制度。金融政策が有効でBP曲線調整が自動的に行われる。",
  "固定相場制": "為替レートを特定水準に維持する制度。財政政策が有効だが金融政策の自律性が失われる。",
  "円安": "円の価値が下落し、1ドルあたりの円が増える状態。日本の輸出企業に有利だが輸入コストが上昇。",
  "円高": "円の価値が上昇し、1ドルあたりの円が減る状態。輸入コストは低下するが輸出企業の競争力が低下。",
}

interface Props {
  term: string
  children: React.ReactNode
  className?: string
}

export function EconomicTooltip({ term, children, className = "" }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const definition = TERM_DEFINITIONS[term]

  if (!definition) return <span className={className}>{children}</span>

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left })
    }
    setVisible(true)
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        className={`cursor-help border-b border-dashed border-terminal-cyan/60 text-terminal-cyan/90 ${className}`}
      >
        {children}
      </span>
      {visible && pos && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-50 max-w-[280px] rounded border border-terminal-cyan/30 bg-card px-3 py-2 shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-terminal-cyan">{term}</div>
          <p className="text-[11px] leading-relaxed text-foreground/80">{definition}</p>
        </div>,
        document.body
      )}
    </>
  )
}

/** テキスト中の経済用語を自動的にツールチップ付きに変換するユーティリティ */
export function withTooltips(text: string): React.ReactNode[] {
  const terms = Object.keys(TERM_DEFINITIONS)
  // 長い語を先にマッチさせる
  const sorted = [...terms].sort((a, b) => b.length - a.length)
  const pattern = new RegExp(`(${sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g")

  const parts = text.split(pattern)
  return parts.map((part, i) =>
    TERM_DEFINITIONS[part]
      ? <EconomicTooltip key={i} term={part}>{part}</EconomicTooltip>
      : <span key={i}>{part}</span>
  )
}
