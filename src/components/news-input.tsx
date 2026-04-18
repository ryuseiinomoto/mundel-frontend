"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Send, Loader2, Newspaper } from "lucide-react"

const SAMPLE_NEWS = [
  { label: "米利上げ", text: "米連邦準備制度理事会（FRB）は政策金利を0.25%引き上げ、5.50%とすることを決定した。インフレ抑制を優先する姿勢を維持している。" },
  { label: "円安進行", text: "ドル円相場は一時155円台に突入した。日米金利差の拡大を背景に円売りドル買いが加速している。" },
  { label: "日銀政策修正", text: "日本銀行はイールドカーブコントロール政策を修正し、長期金利の上限を1.0%に引き上げることを決定した。" },
  { label: "米CPI上昇", text: "米労働省が発表した消費者物価指数（CPI）は前年比4.2%上昇し、市場予想の3.8%を上回った。" },
  { label: "リスクオフ", text: "地政学的リスクの高まりを受けて市場はリスクオフムードが強まり、安全資産である円や金に資金が流入している。" },
]

interface Props {
  onSubmit: (text: string) => void
  isLoading: boolean
}

export function NewsInput({ onSubmit, isLoading }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    onSubmit(text.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (text.trim() && !isLoading) onSubmit(text.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Newspaper className="h-3.5 w-3.5" style={{ color: "rgba(220,180,60,0.8)" }} />
        <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "rgba(220,180,60,0.8)" }}>
          {t("NEWS_INPUT_TITLE")}
        </span>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("NEWS_INPUT_PLACEHOLDER")}
          rows={5}
          className="w-full resize-none rounded-xl px-4 py-3 text-[13px] leading-relaxed outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
            caretColor: "rgba(220,180,60,0.8)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = "1px solid rgba(220,180,60,0.35)"
            e.currentTarget.style.boxShadow = "0 0 0 1px rgba(220,180,60,0.1)"
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"
            e.currentTarget.style.boxShadow = "none"
          }}
        />
        <div className="absolute bottom-2.5 right-3 text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>
          ⌘ + Enter
        </div>
      </div>

      {/* サンプルニュース */}
      <div className="flex flex-wrap gap-1.5">
        {SAMPLE_NEWS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => setText(sample.text)}
            className="rounded-lg px-2.5 py-1 text-[9px] tracking-wider transition-all"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = "1px solid rgba(220,180,60,0.4)"
              e.currentTarget.style.color = "rgba(220,180,60,0.9)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"
              e.currentTarget.style.color = "rgba(255,255,255,0.3)"
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <motion.button
        type="submit"
        disabled={isLoading || !text.trim()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-bold tracking-[0.15em] transition-all disabled:opacity-30"
        style={{
          background: "linear-gradient(135deg, rgba(220,180,60,0.15), rgba(0,180,200,0.10))",
          border: "1px solid rgba(220,180,60,0.4)",
          color: "rgba(220,180,60,0.95)",
          boxShadow: "0 0 20px rgba(220,180,60,0.08)",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t("NEWS_INPUT_BUTTON_LOADING")}
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            {t("NEWS_INPUT_BUTTON")}
          </>
        )}
      </motion.button>
    </form>
  )
}
