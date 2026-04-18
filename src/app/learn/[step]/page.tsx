"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, X, BookOpen, TrendingUp } from "lucide-react"
import { STEPS, getStep, markComplete, isComplete, isUnlocked, type ContentSection, type QuizQuestion } from "@/lib/course"
import { SunriseBackground } from "@/components/sunrise-background"

export default function StepPage() {
  const router = useRouter()
  const params = useParams()
  const stepId = Number(params.step)
  const step = getStep(stepId)

  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    if (isComplete(stepId)) setCleared(true)
    if (!isUnlocked(stepId)) router.replace("/learn")
  }, [stepId, router])

  if (!step) {
    router.push("/learn")
    return null
  }

  const allAnswered = step.quiz.every((q: QuizQuestion) => submitted[q.id])
  const allCorrect = step.quiz.every((q: QuizQuestion) => answers[q.id] === q.correct)

  function handleSelect(qId: string, idx: number) {
    if (submitted[qId]) return
    setAnswers((prev) => ({ ...prev, [qId]: idx }))
  }

  function handleSubmitQuestion(qId: string) {
    if (answers[qId] == null) return
    setSubmitted((prev) => ({ ...prev, [qId]: true }))
  }

  function handleClear() {
    markComplete(stepId)
    setCleared(true)
  }

  const prevStep = stepId > 1 ? stepId - 1 : null
  const nextStep = stepId < STEPS.length ? stepId + 1 : null

  return (
    <div className="relative min-h-screen" style={{ background: "#070412" }}>
      {/* 朝日背景（fixed でスクロールと切り離す） */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <SunriseBackground />
      </div>

      {/* ヘッダー */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/6 px-6 py-4">
        <button
          onClick={() => router.push("/learn")}
          className="flex items-center gap-2 text-[11px] text-white/25 transition-colors hover:text-white/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          コース一覧
        </button>
        <span className="text-[10px] font-bold tracking-[0.3em]" style={{ color: "rgba(220,180,60,0.5)" }}>
          STEP {step.id} / {STEPS.length}
        </span>
        <div className="w-20" />
      </div>

      {/* プログレスバー */}
      <div className="relative z-10 h-0.5 w-full" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${(step.id / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, rgba(220,180,60,0.7), rgba(0,210,230,0.5))",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-10">
        {/* ステップヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" style={{ color: "rgba(220,180,60,0.7)" }} />
            <span className="text-[10px] font-bold tracking-[0.25em]" style={{ color: "rgba(220,180,60,0.7)" }}>
              STEP {step.id}
            </span>
            {cleared && (
              <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider"
                style={{ background: "rgba(0,255,128,0.12)", color: "rgba(0,255,128,0.8)" }}>
                <Check className="h-2.5 w-2.5" /> CLEAR
              </span>
            )}
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">{step.title}</h1>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.82)" }}>{step.subtitle}</p>

          {/* キーポイント */}
          <div className="mt-4 flex flex-col gap-1.5">
            {step.points.map((pt: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "rgba(220,180,60,0.6)" }} />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.72)" }}>{pt}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 学習コンテンツ */}
        <div className="mb-10 flex flex-col gap-5">
          {step.sections.map((section: ContentSection, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="rounded-xl p-5"
              style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(10,4,20,0.78)", backdropFilter: "blur(12px)" }}
            >
              <h2 className="mb-3 text-[12px] font-bold" style={{ color: "rgba(0,210,230,0.8)" }}>
                {section.heading}
              </h2>
              <div className="flex flex-col gap-2">
                {section.body.split("\n\n").map((para: string, j: number) => (
                  <p key={j} className="whitespace-pre-line text-[13px] leading-[1.85]"
                    style={{ color: "rgba(255,255,255,0.82)" }}>
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* クイズ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="mb-5 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: "rgba(220,180,60,0.35)" }} />
            <span className="text-[10px] font-bold tracking-[0.25em]" style={{ color: "rgba(240,190,70,0.90)" }}>
              確認クイズ
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(220,180,60,0.35)" }} />
          </div>

          <div className="flex flex-col gap-6">
            {step.quiz.map((q: QuizQuestion, qi: number) => {
              const selected = answers[q.id]
              const isSubmitted = submitted[q.id]
              const isCorrect = isSubmitted && selected === q.correct

              return (
                <div key={q.id} className="flex flex-col gap-3 rounded-xl p-4"
                  style={{ background: "rgba(10,4,22,0.80)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}
                >
                  <p className="text-[13px] font-bold leading-relaxed" style={{ color: "rgba(255,255,255,0.95)" }}>
                    <span style={{ color: "rgba(240,190,70,0.95)" }}>Q{qi + 1}. </span>
                    {q.question}
                  </p>

                  <div className="flex flex-col gap-2">
                    {q.options.map((opt: string, oi: number) => {
                      let borderColor = "rgba(255,255,255,0.12)"
                      let bgColor = "rgba(10,4,20,0.72)"
                      let textColor = "rgba(255,255,255,0.82)"

                      if (!isSubmitted && selected === oi) {
                        borderColor = "rgba(220,180,60,0.55)"
                        bgColor = "rgba(50,30,4,0.82)"
                        textColor = "rgba(255,255,255,0.95)"
                      }
                      if (isSubmitted && oi === q.correct) {
                        borderColor = "rgba(0,255,128,0.45)"
                        bgColor = "rgba(0,40,20,0.80)"
                        textColor = "rgba(0,255,128,0.95)"
                      }
                      if (isSubmitted && selected === oi && oi !== q.correct) {
                        borderColor = "rgba(239,68,68,0.45)"
                        bgColor = "rgba(50,8,8,0.80)"
                        textColor = "rgba(239,68,68,0.9)"
                      }

                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelect(q.id, oi)}
                          disabled={isSubmitted}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[12px] transition-all"
                          style={{ border: `1px solid ${borderColor}`, background: bgColor, color: textColor, backdropFilter: "blur(10px)" }}
                        >
                          <span className="shrink-0 text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                          {isSubmitted && oi === q.correct && (
                            <Check className="ml-auto h-4 w-4 shrink-0" style={{ color: "rgba(0,255,128,0.8)" }} />
                          )}
                          {isSubmitted && selected === oi && oi !== q.correct && (
                            <X className="ml-auto h-4 w-4 shrink-0" style={{ color: "rgba(239,68,68,0.8)" }} />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* 回答ボタン */}
                  {!isSubmitted && (
                    <button
                      onClick={() => handleSubmitQuestion(q.id)}
                      disabled={selected == null}
                      className="self-end rounded-lg px-4 py-2 text-[11px] font-bold tracking-wide transition-all disabled:opacity-30"
                      style={{
                        border: "1px solid rgba(220,180,60,0.35)",
                        background: "rgba(220,180,60,0.08)",
                        color: "rgba(220,180,60,0.9)",
                      }}
                    >
                      回答する
                    </button>
                  )}

                  {/* 解説 */}
                  <AnimatePresence>
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl px-4 py-3"
                          style={{
                            border: isCorrect ? "1px solid rgba(0,255,128,0.3)" : "1px solid rgba(239,68,68,0.3)",
                            background: isCorrect ? "rgba(0,35,18,0.82)" : "rgba(45,8,8,0.82)",
                            backdropFilter: "blur(10px)",
                          }}>
                          <p className="mb-1 text-[10px] font-bold"
                            style={{ color: isCorrect ? "rgba(0,255,128,0.8)" : "rgba(239,68,68,0.8)" }}>
                            {isCorrect ? "正解！" : "不正解"}
                          </p>
                          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                            {q.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* クリアボタン */}
          <AnimatePresence>
            {allAnswered && allCorrect && !cleared && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-xl p-6 text-center"
                style={{ border: "1px solid rgba(0,255,128,0.35)", background: "rgba(0,35,18,0.85)", backdropFilter: "blur(12px)" }}
              >
                <p className="mb-1 text-sm font-bold" style={{ color: "rgba(0,255,128,0.9)" }}>
                  全問正解！
                </p>
                <p className="mb-4 text-[11px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                  STEP {step.id} をクリアしました
                </p>
                <button
                  onClick={handleClear}
                  className="rounded-xl px-6 py-2.5 text-[12px] font-bold tracking-wide"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,255,128,0.2), rgba(0,180,200,0.12))",
                    border: "1px solid rgba(0,255,128,0.4)",
                    color: "rgba(0,255,180,0.95)",
                  }}
                >
                  クリアして次へ
                </button>
              </motion.div>
            )}

            {allAnswered && !allCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-xl p-5 text-center"
                style={{ border: "1px solid rgba(239,68,68,0.35)", background: "rgba(45,8,8,0.85)", backdropFilter: "blur(12px)" }}
              >
                <p className="mb-1 text-[12px] font-bold" style={{ color: "rgba(239,68,68,0.8)" }}>
                  不正解の問題があります
                </p>
                <p className="mb-3 text-[11px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                  解説を読んで、もう一度挑戦してください
                </p>
                <button
                  onClick={() => {
                    setAnswers({})
                    setSubmitted({})
                  }}
                  className="rounded-lg px-4 py-2 text-[11px] font-bold"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.90)" }}
                >
                  もう一度挑戦
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 8: 模擬トレードへ誘導（クリア前から常時表示） */}
          {step.id === 8 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl p-6"
              style={{ border: "1px solid rgba(220,180,60,0.35)", background: "rgba(30,18,4,0.85)", backdropFilter: "blur(12px)" }}
            >
              <p className="mb-1 text-[12px] font-bold" style={{ color: "rgba(220,180,60,0.9)" }}>
                いよいよ実践！
              </p>
              <p className="mb-5 text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                ここまで学んだ知識を使って、実際に模擬トレードをやってみましょう。<br />
                根拠を持ってエントリーすることが大切です。
              </p>
              <button
                onClick={() => router.push("/trade")}
                className="group flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold tracking-wide transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(220,180,60,0.2), rgba(0,180,200,0.12))",
                  border: "1px solid rgba(220,180,60,0.45)",
                  color: "rgba(220,180,60,0.95)",
                  boxShadow: "0 0 20px rgba(220,180,60,0.1)",
                }}
              >
                <TrendingUp className="h-4 w-4" />
                やってみる
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ナビゲーション */}
        <div className="mt-10 flex items-center justify-between border-t border-white/6 pt-6">
          {prevStep ? (
            <button
              onClick={() => router.push(`/learn/${prevStep}`)}
              className="flex items-center gap-2 text-[11px] text-white/25 transition-colors hover:text-white/50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              STEP {prevStep}
            </button>
          ) : <div />}

          {nextStep ? (
            <button
              onClick={() => router.push(`/learn/${nextStep}`)}
              className="flex items-center gap-2 text-[11px] transition-colors"
              style={{ color: "rgba(0,210,230,0.6)" }}
            >
              STEP {nextStep}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  )
}
