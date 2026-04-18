"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, BarChart2, Newspaper, TrendingUp, Zap } from "lucide-react"

const STEPS = [
  {
    id: "welcome",
    eyebrow: "MUNDEL へようこそ",
    title: "根拠を持って、\nトレードする。",
    description:
      "スイング・ポジショントレードに必要なマクロ経済の読み方を、実際のニュースで鍛えるトレーニングツールです。なぜ為替が動くかを理解してから、取引する。",
    icon: null,
    features: [
      { icon: Newspaper, label: "ニュース分析", desc: "IS-LM-BPモデルで根拠を理解する" },
      { icon: BarChart2, label: "IS-LM-BPモデル", desc: "マクロ経済の変化をグラフで可視化" },
      { icon: TrendingUp, label: "AIシグナル", desc: "「なぜそうなるか」の根拠を確認" },
      { icon: Zap, label: "模擬トレード", desc: "分析した根拠でエントリーを練習" },
    ],
  },
  {
    id: "news",
    eyebrow: "STEP 1",
    title: "ニュースで経済を読む。",
    description:
      "気になる経済ニュースを入力してください。サンプルニュースボタンを使えばワンクリックで試せます。IS-LM-BPモデルがそのニュースの影響を分析します。",
    icon: Newspaper,
    features: null,
  },
  {
    id: "graph",
    eyebrow: "STEP 2",
    title: "経済の変化を根拠として理解する。",
    description:
      "IS-LM-BPグラフが、ニュースによって経済がどう変化するかを示します。曲線のシフトと新しい均衡点が、為替の方向性の根拠になります。",
    icon: BarChart2,
    features: null,
  },
  {
    id: "trade",
    eyebrow: "STEP 3",
    title: "分析した根拠で取引する。",
    description:
      "理解した根拠をもとに、模擬トレードでエントリーを練習しましょう。感覚ではなくマクロ経済の理論に基づいた判断を、繰り返し鍛えます。",
    icon: TrendingUp,
    features: null,
  },
]

const STORAGE_KEY = "mundel_onboarding_done"

export function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
  }, [])

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, "true")
    setVisible(false)
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(step + 1)
    else handleClose()
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1)
  }

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at 15% 60%, rgba(0,255,128,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 25%, rgba(0,220,255,0.06) 0%, transparent 50%), rgba(0,0,0,0.82)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(0,255,128,0.07), 0 0 120px rgba(0,220,255,0.04), 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* 上部グラデーションライン */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,255,128,0.4), rgba(0,220,255,0.3), transparent)",
              }}
            />

            {/* 閉じるボタン */}
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 rounded-full p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Eyebrow */}
                  <p className="mb-4 text-[10px] font-bold tracking-[0.25em] text-terminal-green/70">
                    {current.eyebrow}
                  </p>

                  {/* Icon (Step 2〜4) */}
                  {current.icon && (
                    <div className="mb-5 inline-flex items-center justify-center rounded-xl border border-white/8 bg-white/4 p-3">
                      <current.icon className="h-6 w-6 text-terminal-green/80" />
                    </div>
                  )}

                  {/* Title */}
                  <h2
                    className="mb-4 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-white"
                    style={
                      isFirst
                        ? {
                            background:
                              "linear-gradient(135deg, #ffffff 0%, rgba(0,255,128,0.9) 60%, rgba(0,220,255,0.8) 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : {}
                    }
                  >
                    {current.title}
                  </h2>

                  {/* Description */}
                  <p className="mb-8 text-sm leading-relaxed text-white/45">
                    {current.description}
                  </p>

                  {/* Feature Grid (Step 1のみ) */}
                  {current.features && (
                    <div className="mb-8 grid grid-cols-2 gap-3">
                      {current.features.map((f) => (
                        <div
                          key={f.label}
                          className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-4"
                        >
                          <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-terminal-green/60" />
                          <div>
                            <p className="text-xs font-semibold text-white/80">{f.label}</p>
                            <p className="mt-0.5 text-[10px] text-white/35">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* ナビゲーション */}
              <div className="flex items-center justify-between">
                {/* ドットインジケーター */}
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === step ? "20px" : "6px",
                        background:
                          i === step
                            ? "rgba(0,255,128,0.8)"
                            : "rgba(255,255,255,0.12)",
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[11px] font-bold tracking-wide transition-all"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,255,128,0.15), rgba(0,220,255,0.10))",
                      border: "1px solid rgba(0,255,128,0.25)",
                      color: "rgba(0,255,180,0.9)",
                    }}
                  >
                    {isLast ? "Get Started" : "Continue"}
                    {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
