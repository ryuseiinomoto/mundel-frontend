"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

// 右端の波形パス（4つのうねり）
const WAVE_PATH = [
  "M 0,0",
  "L 100,0",
  "C 126,6  74,19 100,25",
  "C 126,31 74,44 100,50",
  "C 126,56 74,69 100,75",
  "C 126,81 74,94 100,100",
  "L 0,100 Z",
].join(" ")

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 波ワイプ オーバーレイ */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[200]"
        style={{ width: "130vw" }}
        initial={{ x: "-130vw" }}
        animate={{ x: ["-130vw", "0vw", "130vw"] }}
        transition={{
          duration: 1.0,
          times: [0, 0.44, 1],
          ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
        }}
      >
        <svg
          viewBox="0 0 130 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="wipe-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2e0a50" />
              <stop offset="30%"  stopColor="#a03020" />
              <stop offset="60%"  stopColor="#d87828" />
              <stop offset="100%" stopColor="#004870" />
            </linearGradient>
            {/* 波に乗る光沢 */}
            <linearGradient id="wipe-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)"   />
              <stop offset="70%"  stopColor="rgba(255,255,255,0.06)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.14)"/>
            </linearGradient>
          </defs>
          <path d={WAVE_PATH} fill="url(#wipe-grad)" />
          <path d={WAVE_PATH} fill="url(#wipe-sheen)" />
        </svg>
      </motion.div>

      {/* ページコンテンツ（波が去るタイミングでフェードイン） */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.46, duration: 0.28, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  )
}
