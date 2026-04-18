"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Lock, Clock, ChevronRight } from "lucide-react"
import { STEPS, getProgress, isUnlocked } from "@/lib/course"
import { SunriseBackground } from "@/components/sunrise-background"

export default function LearnPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [completed, setCompleted] = useState<number[]>([])
  const [lockedMsg, setLockedMsg] = useState<number | null>(null)

  useEffect(() => {
    setCompleted(getProgress())
    setMounted(true)
  }, [])

  const completedCount = completed.length

  return (
    <div className="relative min-h-screen" style={{ background: "#070412" }}>
      {/* 朝日背景（fixed でスクロールと切り離す） */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <SunriseBackground />
      </div>

      {/* ヘッダー */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/6 px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[11px] text-white/25 transition-colors hover:text-white/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <span className="text-[10px] font-bold tracking-[0.35em]" style={{ color: "rgba(220,180,60,0.6)" }}>
          LEARNING PATH
        </span>
        <div className="w-16" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-10">
        {/* タイトル */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-2 text-[10px] font-bold tracking-[0.3em]" style={{ color: "rgba(220,180,60,0.7)" }}>
            FX BEGINNER COURSE
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">
            FXトレーダーへの<br />11ステップ
          </h1>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
            為替の基礎から、根拠のあるトレードができるようになるまでを順番に学べます。<br />
            各ステップのクイズに正解するとクリアになります。
          </p>

          {/* 進捗バー */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                進捗
              </span>
              <span className="text-[10px] font-bold" style={{ color: "rgba(220,180,60,0.8)" }}>
                {completedCount} / {STEPS.length} クリア
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, rgba(220,180,60,0.8), rgba(0,210,230,0.6))" }}
              />
            </div>
          </div>
        </motion.div>

        {/* ステップ一覧 */}
        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const done = mounted && completed.includes(step.id)
            const unlocked = mounted && isUnlocked(step.id)
            const locked = !unlocked

            return (
              <motion.div key={step.id} className="flex flex-col gap-1">
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  onClick={() => {
                    if (locked) {
                      setLockedMsg(step.id)
                      setTimeout(() => setLockedMsg(null), 2500)
                    } else {
                      router.push(`/learn/${step.id}`)
                    }
                  }}
                  className="group flex items-center gap-4 rounded-xl p-4 text-left transition-all"
                  style={{
                    border: done
                      ? "1px solid rgba(0,255,128,0.3)"
                      : locked
                      ? "1px solid rgba(255,255,255,0.10)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: done
                      ? "rgba(0,30,15,0.78)"
                      : locked
                      ? "rgba(10,5,22,0.72)"
                      : "rgba(10,4,20,0.75)",
                    backdropFilter: "blur(12px)",
                    opacity: locked ? 0.72 : 1,
                    cursor: locked ? "not-allowed" : "pointer",
                  }}
                >
                  {/* ステップ番号 / 完了 / ロックアイコン */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      border: done
                        ? "1px solid rgba(0,255,128,0.45)"
                        : locked
                        ? "1px solid rgba(255,255,255,0.14)"
                        : "1px solid rgba(255,255,255,0.18)",
                      background: done
                        ? "rgba(0,50,25,0.7)"
                        : locked
                        ? "rgba(15,8,30,0.65)"
                        : "rgba(15,8,30,0.7)",
                      color: done ? "rgba(0,255,128,0.9)" : locked ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {done ? <Check className="h-4 w-4" /> : locked ? <Lock className="h-3.5 w-3.5" /> : String(step.id).padStart(2, "0")}
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold" style={{
                        color: done ? "rgba(255,255,255,0.7)" : locked ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.78)"
                      }}>
                        {step.title}
                      </p>
                      {done && (
                        <span className="rounded-md px-1.5 py-0.5 text-[8px] font-bold tracking-wider"
                          style={{ background: "rgba(0,255,128,0.12)", color: "rgba(0,255,128,0.8)" }}>
                          CLEAR
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px]" style={{ color: locked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.72)" }}>
                      {locked ? `STEP ${step.id - 1} をクリアすると開放` : step.subtitle}
                    </p>
                  </div>

                  {/* 右側 */}
                  <div className="flex shrink-0 items-center gap-2">
                    {!locked && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.68)" }}>
                        <Clock className="h-3 w-3" />
                        {step.duration}
                      </span>
                    )}
                    {locked
                      ? <Lock className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.20)" }} />
                      : <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ color: "rgba(255,255,255,0.68)" }} />
                    }
                  </div>
                </motion.button>

                {/* ロック時のメッセージ */}
                {lockedMsg === step.id && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-4 text-[10px]"
                    style={{ color: "rgba(240,190,70,0.80)" }}
                  >
                    STEP {step.id - 1} のクイズに全問正解するとここが開放されます
                  </motion.p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 全クリア後のCTA */}
        {completedCount === STEPS.length && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-xl p-6 text-center"
            style={{
              border: "1px solid rgba(220,180,60,0.35)",
              background: "rgba(30,18,4,0.82)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="mb-1 text-sm font-bold" style={{ color: "rgba(220,180,60,0.9)" }}>
              全ステップクリア！
            </p>
            <p className="mb-4 text-[11px]" style={{ color: "rgba(255,255,255,0.78)" }}>
              学んだ知識を使って、実際に模擬トレードをやってみましょう。
            </p>
            <button
              onClick={() => router.push("/trade")}
              className="rounded-xl px-6 py-2.5 text-[12px] font-bold tracking-wide"
              style={{
                background: "linear-gradient(135deg, rgba(220,180,60,0.2), rgba(0,180,200,0.12))",
                border: "1px solid rgba(220,180,60,0.4)",
                color: "rgba(220,180,60,0.95)",
              }}
            >
              模擬トレードへ →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
