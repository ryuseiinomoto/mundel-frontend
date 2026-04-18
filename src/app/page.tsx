"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { TrendingUp, ArrowRight, BookOpen, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import "@/i18n"
import { OnboardingModal } from "@/components/onboarding-modal"

// -------------------------------------------------------------------
// Rapture — 泡パーティクル（固定値でhydration安全）
// -------------------------------------------------------------------
const BUBBLES = [
  { x:6,  y:88, s:3, d:7,  delay:0   }, { x:14, y:75, s:2, d:9,  delay:1.2 },
  { x:22, y:92, s:4, d:8,  delay:3.1 }, { x:31, y:80, s:2, d:11, delay:0.5 },
  { x:38, y:95, s:3, d:6,  delay:4.2 }, { x:47, y:70, s:2, d:10, delay:2.0 },
  { x:55, y:85, s:3, d:8,  delay:1.7 }, { x:62, y:90, s:2, d:12, delay:3.5 },
  { x:70, y:78, s:4, d:7,  delay:0.8 }, { x:78, y:93, s:2, d:9,  delay:2.6 },
  { x:85, y:82, s:3, d:11, delay:1.4 }, { x:92, y:88, s:2, d:8,  delay:4.0 },
  { x:10, y:60, s:2, d:13, delay:2.3 }, { x:44, y:50, s:3, d:10, delay:0.9 },
  { x:67, y:65, s:2, d:9,  delay:3.3 }, { x:88, y:55, s:3, d:12, delay:1.8 },
]

// アンバー窓の光（建物位置に合わせて配置）
const WINDOWS = [
  // 左ブロック
  { x:3,  y:72, w:10, h:7,  c:"rgba(220,150,30,0.55)" },
  { x:7,  y:72, w:8,  h:7,  c:"rgba(200,120,20,0.40)" },
  { x:3,  y:63, w:8,  h:6,  c:"rgba(210,140,25,0.50)" },
  { x:10, y:63, w:6,  h:6,  c:"rgba(180,100,15,0.35)" },
  // 左タワー
  { x:17, y:52, w:6,  h:5,  c:"rgba(220,160,40,0.60)" },
  { x:21, y:52, w:6,  h:5,  c:"rgba(200,130,25,0.45)" },
  { x:17, y:60, w:6,  h:5,  c:"rgba(215,145,30,0.55)" },
  { x:23, y:43, w:5,  h:4,  c:"rgba(230,170,40,0.65)" },
  { x:19, y:35, w:4,  h:4,  c:"rgba(220,155,35,0.50)" },
  // センタータワー（最も明るい）
  { x:47, y:28, w:7,  h:6,  c:"rgba(240,180,50,0.70)" },
  { x:52, y:28, w:7,  h:6,  c:"rgba(220,160,40,0.60)" },
  { x:47, y:38, w:7,  h:6,  c:"rgba(235,170,45,0.65)" },
  { x:52, y:38, w:6,  h:6,  c:"rgba(200,140,30,0.50)" },
  { x:49, y:48, w:5,  h:5,  c:"rgba(225,165,40,0.60)" },
  { x:47, y:58, w:7,  h:6,  c:"rgba(210,150,35,0.55)" },
  { x:54, y:58, w:6,  h:6,  c:"rgba(190,120,20,0.40)" },
  // 右エリア
  { x:68, y:55, w:6,  h:5,  c:"rgba(215,145,30,0.55)" },
  { x:73, y:55, w:6,  h:5,  c:"rgba(200,130,25,0.45)" },
  { x:68, y:63, w:8,  h:6,  c:"rgba(220,150,30,0.50)" },
  { x:78, y:45, w:5,  h:5,  c:"rgba(230,160,35,0.60)" },
  { x:82, y:45, w:5,  h:5,  c:"rgba(210,140,28,0.50)" },
  { x:78, y:53, w:5,  h:5,  c:"rgba(215,145,30,0.55)" },
  { x:88, y:60, w:6,  h:5,  c:"rgba(200,130,25,0.45)" },
  { x:93, y:68, w:8,  h:6,  c:"rgba(220,150,30,0.50)" },
  // ネオンサイン風（シアン）
  { x:30, y:42, w:12, h:3,  c:"rgba(0,220,230,0.55)"  },
  { x:62, y:50, w:10, h:3,  c:"rgba(0,200,220,0.50)"  },
  { x:84, y:38, w:8,  h:3,  c:"rgba(0,210,230,0.45)"  },
]

const LANGUAGES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
]

const COURSE_STEPS = [
  { id: 1, title: "為替の仕組みを知る",       subtitle: "FXとは何か、通貨ペアの基本" },
  { id: 2, title: "経済指標を読む",           subtitle: "GDP・金利・インフレの意味" },
  { id: 3, title: "IS-LM-BPモデルを理解する", subtitle: "マクロ経済学の核心" },
  { id: 4, title: "ニュースを分析する",        subtitle: "経済ニュースから曲線シフトを読む" },
  { id: 5, title: "AIシグナルを解釈する",      subtitle: "BUY/SELLの根拠を理解する" },
  { id: 6, title: "リスク管理を学ぶ",          subtitle: "損切り・ポジションサイジング" },
  { id: 7, title: "トレード戦略を立てる",       subtitle: "エントリー根拠の言語化" },
  { id: 8, title: "模擬トレードで実践する",     subtitle: "実際に根拠を持ってトレード" },
]

// -------------------------------------------------------------------
// Rapture 背景
// -------------------------------------------------------------------
function RaptureBackground() {
  return (
    <>
      {/* 深海グラデーション */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: [
          // 海面からの光（上部）
          "radial-gradient(ellipse 100% 30% at 50% 0%,   rgba(0,80,140,0.55)  0%, transparent 70%)",
          // 都市の環境光（下部アンバー）
          "radial-gradient(ellipse 90%  50% at 50% 100%, rgba(180,110,15,0.45) 0%, transparent 65%)",
          // 左タワーの光
          "radial-gradient(ellipse 30%  40% at 20% 85%,  rgba(200,130,25,0.30) 0%, transparent 60%)",
          // センタータワーの光
          "radial-gradient(ellipse 35%  50% at 50% 90%,  rgba(220,150,30,0.35) 0%, transparent 60%)",
          // 右エリアの光
          "radial-gradient(ellipse 28%  35% at 80% 80%,  rgba(190,120,20,0.28) 0%, transparent 55%)",
          // ベース深海色
          "#071e30",
        ].join(", "),
      }} />

      {/* アールデコ ダイヤモンドパターン */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.055]" style={{
        backgroundImage: [
          "repeating-linear-gradient( 45deg, rgba(180,130,30,1) 0px, rgba(180,130,30,1) 1px, transparent 1px, transparent 36px)",
          "repeating-linear-gradient(-45deg, rgba(180,130,30,1) 0px, rgba(180,130,30,1) 1px, transparent 1px, transparent 36px)",
        ].join(", "),
      }} />

      {/* 海面のコースティック光（上部） */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-28 opacity-40" style={{
        backgroundImage: [
          "radial-gradient(ellipse 20% 60% at 15% 0%, rgba(0,150,220,0.6) 0%, transparent 100%)",
          "radial-gradient(ellipse 25% 50% at 45% 0%, rgba(0,130,200,0.5) 0%, transparent 100%)",
          "radial-gradient(ellipse 18% 70% at 75% 0%, rgba(0,160,230,0.6) 0%, transparent 100%)",
        ].join(", "),
        animation: "caustic 12s ease-in-out infinite",
      }} />

      {/* アンバー窓の光 */}
      {WINDOWS.map((w, i) => (
        <div key={i} className="pointer-events-none absolute rounded-sm"
          style={{
            left: `${w.x}%`, top: `${w.y}%`,
            width: `${w.w * 0.6}%`, height: `${w.h * 0.5}%`,
            background: w.c,
            boxShadow: `0 0 ${w.c.includes("220,230") ? "16px 6px" : "10px 4px"} ${w.c}`,
            animation: w.c.includes("220,230")
              ? `neon-flicker ${6 + i * 0.7}s ease-in-out infinite ${i * 0.3}s`
              : `glow-pulse ${4 + i * 0.4}s ease-in-out infinite ${i * 0.2}s`,
          }}
        />
      ))}

      {/* アールデコ建物シルエット SVG */}
      <svg className="pointer-events-none absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice"
        style={{ height: "82%" }}
      >
        <defs>
          <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#061828" />
            <stop offset="100%" stopColor="#041220" />
          </linearGradient>
          <radialGradient id="win-amber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(220,150,30,0.9)" />
            <stop offset="100%" stopColor="rgba(220,150,30,0)" />
          </radialGradient>
        </defs>

        {/* ── 左ブロック群 ── */}
        <rect x="0"   y="450" width="95"  height="150" fill="url(#bldg)" />
        <rect x="5"   y="394" width="85"  height="56"  fill="url(#bldg)" />
        <rect x="15"  y="353" width="65"  height="41"  fill="url(#bldg)" />
        <rect x="28"  y="319" width="40"  height="34"  fill="url(#bldg)" />
        <rect x="36"  y="278" width="24"  height="41"  fill="url(#bldg)" />
        <rect x="42"  y="206" width="12"  height="72"  fill="url(#bldg)" />
        <rect x="44"  y="178" width="8"   height="28"  fill="url(#bldg)" />
        {/* 左タワースパイア */}
        <polygon points="47,113 48,178 46,178" fill="#010b18" />

        {/* ── 左中タワー ── */}
        <rect x="105" y="488" width="110" height="112" fill="url(#bldg)" />
        <rect x="112" y="422" width="96"  height="66"  fill="url(#bldg)" />
        <rect x="122" y="366" width="76"  height="56"  fill="url(#bldg)" />
        <rect x="135" y="315" width="50"  height="51"  fill="url(#bldg)" />
        <rect x="145" y="263" width="30"  height="52"  fill="url(#bldg)" />
        <rect x="151" y="188" width="18"  height="75"  fill="url(#bldg)" />
        <rect x="154" y="146" width="12"  height="42"  fill="url(#bldg)" />
        <polygon points="160,79 162,146 158,146" fill="#010b18" />
        {/* アールデコ装飾（左タワー頂部） */}
        <rect x="157" y="139" width="6"  height="7" fill="#010f20" />
        <rect x="155" y="146" width="10" height="6" fill="#010f20" />

        {/* ── 中央低層ブロック ── */}
        <rect x="230" y="506" width="160" height="94"  fill="url(#bldg)" />
        <rect x="240" y="465" width="140" height="41"  fill="url(#bldg)" />
        <rect x="260" y="431" width="100" height="34"  fill="url(#bldg)" />

        {/* ── センタータワー（最も高い・ラプチャーの象徴） ── */}
        <rect x="400" y="525" width="130" height="75"  fill="url(#bldg)" />
        <rect x="408" y="465" width="114" height="60"  fill="url(#bldg)" />
        <rect x="420" y="403" width="90"  height="62"  fill="url(#bldg)" />
        <rect x="432" y="341" width="66"  height="62"  fill="url(#bldg)" />
        <rect x="442" y="281" width="46"  height="60"  fill="url(#bldg)" />
        <rect x="450" y="216" width="30"  height="65"  fill="url(#bldg)" />
        <rect x="455" y="159" width="20"  height="57"  fill="url(#bldg)" />
        <rect x="458" y="116" width="14"  height="43"  fill="url(#bldg)" />
        <rect x="461" y="84"  width="8"   height="32"  fill="url(#bldg)" />
        <polygon points="465,19 466,84 464,84" fill="#010b18" />
        {/* アールデコ装飾（センタークラウン） */}
        <rect x="457" y="109" width="16" height="7" fill="#010f20" />
        <rect x="455" y="116" width="20" height="6" fill="#010f20" />
        <rect x="453" y="122" width="24" height="4" fill="#010f20" />

        {/* ── 中右エリア ── */}
        <rect x="550" y="497" width="100" height="103" fill="url(#bldg)" />
        <rect x="558" y="446" width="84"  height="51"  fill="url(#bldg)" />
        <rect x="570" y="394" width="60"  height="52"  fill="url(#bldg)" />
        <rect x="582" y="347" width="36"  height="47"  fill="url(#bldg)" />
        <rect x="590" y="291" width="20"  height="56"  fill="url(#bldg)" />
        <rect x="593" y="225" width="14"  height="66"  fill="url(#bldg)" />
        <polygon points="600,165 601,225 599,225" fill="#010b18" />

        {/* ── 右タワー ── */}
        <rect x="680" y="516" width="120" height="84"  fill="url(#bldg)" />
        <rect x="688" y="459" width="104" height="57"  fill="url(#bldg)" />
        <rect x="700" y="403" width="80"  height="56"  fill="url(#bldg)" />
        <rect x="712" y="347" width="56"  height="56"  fill="url(#bldg)" />
        <rect x="722" y="291" width="36"  height="56"  fill="url(#bldg)" />
        <rect x="730" y="225" width="20"  height="66"  fill="url(#bldg)" />
        <rect x="733" y="178" width="14"  height="47"  fill="url(#bldg)" />
        <polygon points="740,116 741,178 739,178" fill="#010b18" />

        {/* ── 右低層群 ── */}
        <rect x="820" y="484" width="140" height="116" fill="url(#bldg)" />
        <rect x="832" y="431" width="116" height="53"  fill="url(#bldg)" />
        <rect x="848" y="394" width="84"  height="37"  fill="url(#bldg)" />
        <rect x="862" y="360" width="56"  height="34"  fill="url(#bldg)" />
        <rect x="875" y="315" width="30"  height="45"  fill="url(#bldg)" />
        <rect x="882" y="263" width="16"  height="52"  fill="url(#bldg)" />
        <polygon points="890,210 891,263 889,263" fill="#010b18" />

        {/* ── 右端タワー ── */}
        <rect x="980"  y="506" width="100" height="94"  fill="url(#bldg)" />
        <rect x="988"  y="454" width="84"  height="52"  fill="url(#bldg)" />
        <rect x="1000" y="403" width="60"  height="51"  fill="url(#bldg)" />
        <rect x="1010" y="353" width="40"  height="50"  fill="url(#bldg)" />
        <rect x="1018" y="296" width="24"  height="57"  fill="url(#bldg)" />
        <rect x="1023" y="240" width="14"  height="56"  fill="url(#bldg)" />
        <rect x="1025" y="197" width="10"  height="43"  fill="url(#bldg)" />
        <polygon points="1030,135 1031,197 1029,197" fill="#010b18" />

        {/* ── 最右端ブロック ── */}
        <rect x="1100" y="497" width="340" height="103" fill="url(#bldg)" />
        <rect x="1115" y="450" width="310" height="47"  fill="url(#bldg)" />
        <rect x="1140" y="409" width="260" height="41"  fill="url(#bldg)" />
        <rect x="1180" y="366" width="180" height="43"  fill="url(#bldg)" />
        <rect x="1210" y="328" width="120" height="38"  fill="url(#bldg)" />
        <rect x="1240" y="291" width="60"  height="37"  fill="url(#bldg)" />
        <rect x="1252" y="248" width="36"  height="43"  fill="url(#bldg)" />
        <rect x="1262" y="206" width="16"  height="42"  fill="url(#bldg)" />
        <polygon points="1270,146 1271,206 1269,206" fill="#010b18" />

        {/* 海底ベース */}
        <rect x="0" y="572" width="1440" height="28" fill="#010810" opacity="0.9" />
      </svg>

      {/* 泡パーティクル */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BUBBLES.map((b, i) => (
          <div key={i} className="absolute rounded-full border border-white/10"
            style={{
              left: `${b.x}%`, top: `${b.y}%`,
              width: `${b.s}px`, height: `${b.s}px`,
              background: "rgba(120,200,255,0.15)",
              animation: `bubble-rise ${b.d}s ease-in infinite ${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 圧力ガラスのスキャンライン */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.012) 0px, rgba(0,0,0,0.012) 1px, transparent 1px, transparent 4px)",
      }} />

      {/* 上部グラデーションライン */}
      <div className="absolute inset-x-0 top-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(0,160,220,0.6), rgba(180,130,30,0.4), transparent)",
      }} />
    </>
  )
}

// -------------------------------------------------------------------
// メインページ
// -------------------------------------------------------------------
export default function LandingPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()

  return (
    <div className="relative flex min-h-screen flex-col items-center px-6 py-16"
      style={{ background: "#071e30" }}
    >
      <OnboardingModal />
      {/* 背景を fixed にしてスクロールと切り離す */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <RaptureBackground />
      </div>

      {/* 言語切り替え */}
      <div className="absolute right-6 top-5 z-10 flex items-center gap-1">
        {LANGUAGES.map((lang, i) => (
          <span key={lang.code} className="flex items-center">
            <button onClick={() => i18n.changeLanguage(lang.code)}
              className="text-[10px] tracking-wide transition-colors"
              style={{
                color: i18n.language === lang.code ? "rgba(0,220,230,0.9)" : "rgba(255,255,255,0.68)",
                fontWeight: i18n.language === lang.code ? "700" : "400",
              }}
            >{lang.label}</button>
            {i < LANGUAGES.length - 1 && <span className="mx-1.5 text-[10px] text-white/10">|</span>}
          </span>
        ))}
      </div>


      {/* ロゴ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 mb-10 mt-6 text-[11px] font-bold tracking-[0.45em]"
        style={{ color: "rgba(0,210,230,0.65)" }}
      >
        {t("LANDING_TAGLINE")}
      </motion.div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 mb-5 text-center"
      >
        <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight"
          style={{
            background: "linear-gradient(135deg, #e8d5a0 0%, #f0c040 40%, rgba(0,210,230,0.9) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(200,140,30,0.3)",
          }}
        >
          {t("LANDING_HERO_1")}
          <br />
          {t("LANDING_HERO_2")}
        </h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed" style={{ color: "rgba(200,180,140,0.75)" }}>
          {t("LANDING_DESC")}
        </p>
      </motion.div>

      {/* 初心者必読バナー */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
        className="relative z-10 mb-6"
      >
        <button
          onClick={() => router.push("/guide")}
          className="group flex items-center gap-3 rounded-xl px-5 py-3 transition-all"
          style={{
            border: "1px solid rgba(234,179,8,0.35)",
            background: "rgba(120,80,0,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(234,179,8,0.18)", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            <BookOpen className="h-3.5 w-3.5" style={{ color: "rgba(250,200,50,0.9)" }} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-wide" style={{ color: "rgba(250,200,50,0.95)" }}>
              FX初心者の方はまずここから
            </p>
            <p className="text-[10px]" style={{ color: "rgba(200,160,40,0.65)" }}>
              なぜマクロ経済を学ぶのか・Mundelの使い方を解説
            </p>
          </div>
          <ArrowRight className="ml-auto h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: "rgba(250,200,50,0.5)" }} />
        </button>
      </motion.div>

      {/* CTAボタン */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
        className="relative z-10 mb-16 flex items-center gap-3"
      >
        <button onClick={() => router.push("/news")}
          className="group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(180,130,20,0.2), rgba(0,180,200,0.12))",
            border: "1px solid rgba(180,130,20,0.45)",
            color: "rgba(220,180,60,0.95)",
            boxShadow: "0 0 28px rgba(180,130,20,0.15), inset 0 1px 0 rgba(255,220,100,0.1)",
          }}
        >
          {t("LANDING_CTA_ANALYSIS")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button onClick={() => router.push("/trade")}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all"
          style={{
            border: "1px solid rgba(0,180,200,0.2)",
            background: "rgba(0,180,200,0.05)",
            color: "rgba(0,210,230,0.8)",
          }}
        >
          {t("LANDING_CTA_TRADE")}
          <TrendingUp className="h-4 w-4" />
        </button>
      </motion.div>

      {/* 8ステップコース */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(200,150,30,0.3)" }} />
          <span className="text-[9px] font-bold tracking-[0.3em]" style={{ color: "rgba(210,165,50,0.75)" }}>FX BEGINNER COURSE</span>
          <div className="h-px flex-1" style={{ background: "rgba(200,150,30,0.3)" }} />
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            border: "1px solid rgba(200,150,25,0.2)",
            background: "rgba(8,22,40,0.75)",
            backdropFilter: "blur(14px)",
          }}
        >
          <p className="mb-5 text-[11px]" style={{ color: "rgba(255,255,255,0.78)" }}>
            為替の基礎から根拠のあるトレードができるようになるまでを、8ステップで学べます。
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {COURSE_STEPS.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.05 }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <span className="shrink-0 text-[10px] font-bold tabular-nums" style={{ color: "rgba(220,180,60,0.5)" }}>
                  {String(step.id).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {step.title}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.72)" }}>
                    {step.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/learn")}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-bold tracking-wide transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(180,130,20,0.2), rgba(0,180,200,0.1))",
                border: "1px solid rgba(180,130,20,0.4)",
                color: "rgba(220,180,60,0.95)",
              }}
            >
              <BookOpen className="h-4 w-4" />
              学習を始める
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => router.push("/trade")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold transition-all"
              style={{
                border: "1px solid rgba(0,180,200,0.2)",
                background: "rgba(0,180,200,0.05)",
                color: "rgba(0,210,230,0.7)",
              }}
            >
              <TrendingUp className="h-4 w-4" />
              模擬トレード
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Check className="h-3 w-3 shrink-0" style={{ color: "rgba(0,255,128,0.5)" }} />
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.68)" }}>
              各ステップのクイズに正解するとクリア。最後に模擬トレードで実践。
            </p>
          </div>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,160,220,0.2), rgba(180,130,20,0.2), transparent)" }}
      />
    </div>
  )
}
