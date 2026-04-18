"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, X, BookOpen, AlertTriangle, Target, Layers } from "lucide-react"

const SECTION_FADE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

// ビルの窓明かり（アンバー系 — 室内から見た夜景）
const WINDOWS = [
  { x:3,  y:72, w:10, h:7,  c:"rgba(220,150,30,0.55)" },
  { x:7,  y:72, w:8,  h:7,  c:"rgba(200,120,20,0.40)" },
  { x:3,  y:63, w:8,  h:6,  c:"rgba(210,140,25,0.50)" },
  { x:10, y:63, w:6,  h:6,  c:"rgba(180,100,15,0.35)" },
  { x:17, y:52, w:6,  h:5,  c:"rgba(220,160,40,0.60)" },
  { x:21, y:52, w:6,  h:5,  c:"rgba(200,130,25,0.45)" },
  { x:17, y:60, w:6,  h:5,  c:"rgba(215,145,30,0.55)" },
  { x:23, y:43, w:5,  h:4,  c:"rgba(230,170,40,0.65)" },
  { x:47, y:28, w:7,  h:6,  c:"rgba(240,180,50,0.70)" },
  { x:52, y:28, w:7,  h:6,  c:"rgba(220,160,40,0.60)" },
  { x:47, y:38, w:7,  h:6,  c:"rgba(235,170,45,0.65)" },
  { x:52, y:38, w:6,  h:6,  c:"rgba(200,140,30,0.50)" },
  { x:49, y:48, w:5,  h:5,  c:"rgba(225,165,40,0.60)" },
  { x:47, y:58, w:7,  h:6,  c:"rgba(210,150,35,0.55)" },
  { x:68, y:55, w:6,  h:5,  c:"rgba(215,145,30,0.55)" },
  { x:73, y:55, w:6,  h:5,  c:"rgba(200,130,25,0.45)" },
  { x:68, y:63, w:8,  h:6,  c:"rgba(220,150,30,0.50)" },
  { x:78, y:45, w:5,  h:5,  c:"rgba(230,160,35,0.60)" },
  { x:88, y:60, w:6,  h:5,  c:"rgba(200,130,25,0.45)" },
  { x:93, y:68, w:8,  h:6,  c:"rgba(220,150,30,0.50)" },
  // ネオン（シアン）
  { x:30, y:42, w:12, h:3,  c:"rgba(0,220,230,0.50)"  },
  { x:62, y:50, w:10, h:3,  c:"rgba(0,200,220,0.45)"  },
  { x:84, y:38, w:8,  h:3,  c:"rgba(0,210,230,0.40)"  },
]

function ApartmentBackground() {
  return (
    <>
      {/* 夜空グラデーション（紺 → 深紫 — 他ページのダークトーンに合わせる） */}
      <div className="absolute inset-0" style={{
        background: [
          "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(180,120,20,0.25) 0%, transparent 65%)",
          "radial-gradient(ellipse 40% 30% at 15% 85%,  rgba(160,100,15,0.18) 0%, transparent 55%)",
          "radial-gradient(ellipse 35% 25% at 85% 80%,  rgba(150,95,15,0.15)  0%, transparent 50%)",
          // 室内ランプの暖色グロー（左上・右上の隅）
          "radial-gradient(ellipse 30% 25% at 5%  10%,  rgba(200,140,30,0.10) 0%, transparent 60%)",
          "radial-gradient(ellipse 25% 20% at 95% 8%,   rgba(200,140,30,0.08) 0%, transparent 55%)",
          "linear-gradient(180deg, #09060f 0%, #0e0918 25%, #100818 55%, #09050d 100%)",
        ].join(", "),
      }} />

      {/* アールデコ ダイヤモンドパターン（他ページと共通） */}
      <div className="absolute inset-0 opacity-[0.045]" style={{
        backgroundImage: [
          "repeating-linear-gradient( 45deg, rgba(180,130,30,1) 0px, rgba(180,130,30,1) 1px, transparent 1px, transparent 36px)",
          "repeating-linear-gradient(-45deg, rgba(180,130,30,1) 0px, rgba(180,130,30,1) 1px, transparent 1px, transparent 36px)",
        ].join(", "),
      }} />

      {/* 窓枠シルエット（画面左端・右端 — アパートの室内感） */}
      {/* 左窓枠 */}
      <div className="absolute top-0 bottom-0 left-0 w-[3.5%]" style={{
        background: "linear-gradient(90deg, rgba(6,3,12,0.92) 0%, rgba(6,3,12,0.60) 60%, transparent 100%)",
      }} />
      <div className="absolute top-0 bottom-[18%] left-[3.5%] w-[0.3%]" style={{
        background: "linear-gradient(180deg, rgba(80,55,20,0.0) 0%, rgba(80,55,20,0.35) 20%, rgba(80,55,20,0.35) 80%, rgba(80,55,20,0.0) 100%)",
      }} />
      {/* 右窓枠 */}
      <div className="absolute top-0 bottom-0 right-0 w-[3.5%]" style={{
        background: "linear-gradient(270deg, rgba(6,3,12,0.92) 0%, rgba(6,3,12,0.60) 60%, transparent 100%)",
      }} />
      <div className="absolute top-0 bottom-[18%] right-[3.5%] w-[0.3%]" style={{
        background: "linear-gradient(180deg, rgba(80,55,20,0.0) 0%, rgba(80,55,20,0.35) 20%, rgba(80,55,20,0.35) 80%, rgba(80,55,20,0.0) 100%)",
      }} />

      {/* 窓の明かり */}
      {WINDOWS.map((w, i) => (
        <div key={i} className="absolute rounded-sm"
          style={{
            left: `${w.x}%`, top: `${w.y}%`,
            width: `${w.w * 0.6}%`, height: `${w.h * 0.5}%`,
            background: w.c,
            boxShadow: `0 0 ${w.c.includes("0,220") || w.c.includes("0,200") ? "14px 5px" : "10px 4px"} ${w.c}`,
            animation: w.c.includes("0,220") || w.c.includes("0,200")
              ? `neon-flicker ${6 + i * 0.7}s ease-in-out infinite ${i * 0.3}s`
              : `glow-pulse ${4 + i * 0.4}s ease-in-out infinite ${i * 0.2}s`,
          }}
        />
      ))}

      {/* ビルシルエット SVG */}
      <svg className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice"
        style={{ height: "82%" }}
      >
        <defs>
          <linearGradient id="bldg-ap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080510" />
            <stop offset="100%" stopColor="#04030a" />
          </linearGradient>
        </defs>
        <rect x="0"   y="450" width="95"  height="150" fill="url(#bldg-ap)" />
        <rect x="5"   y="394" width="85"  height="56"  fill="url(#bldg-ap)" />
        <rect x="15"  y="353" width="65"  height="41"  fill="url(#bldg-ap)" />
        <rect x="28"  y="319" width="40"  height="34"  fill="url(#bldg-ap)" />
        <rect x="36"  y="278" width="24"  height="41"  fill="url(#bldg-ap)" />
        <rect x="42"  y="206" width="12"  height="72"  fill="url(#bldg-ap)" />
        <rect x="44"  y="178" width="8"   height="28"  fill="url(#bldg-ap)" />
        <polygon points="47,113 48,178 46,178" fill="#03020a" />
        <rect x="105" y="488" width="110" height="112" fill="url(#bldg-ap)" />
        <rect x="112" y="422" width="96"  height="66"  fill="url(#bldg-ap)" />
        <rect x="122" y="366" width="76"  height="56"  fill="url(#bldg-ap)" />
        <rect x="135" y="315" width="50"  height="51"  fill="url(#bldg-ap)" />
        <rect x="145" y="263" width="30"  height="52"  fill="url(#bldg-ap)" />
        <rect x="151" y="188" width="18"  height="75"  fill="url(#bldg-ap)" />
        <rect x="154" y="146" width="12"  height="42"  fill="url(#bldg-ap)" />
        <polygon points="160,79 162,146 158,146" fill="#03020a" />
        <rect x="230" y="506" width="160" height="94"  fill="url(#bldg-ap)" />
        <rect x="240" y="465" width="140" height="41"  fill="url(#bldg-ap)" />
        <rect x="260" y="431" width="100" height="34"  fill="url(#bldg-ap)" />
        <rect x="400" y="525" width="130" height="75"  fill="url(#bldg-ap)" />
        <rect x="408" y="465" width="114" height="60"  fill="url(#bldg-ap)" />
        <rect x="420" y="403" width="90"  height="62"  fill="url(#bldg-ap)" />
        <rect x="432" y="341" width="66"  height="62"  fill="url(#bldg-ap)" />
        <rect x="442" y="281" width="46"  height="60"  fill="url(#bldg-ap)" />
        <rect x="450" y="216" width="30"  height="65"  fill="url(#bldg-ap)" />
        <rect x="455" y="159" width="20"  height="57"  fill="url(#bldg-ap)" />
        <rect x="458" y="116" width="14"  height="43"  fill="url(#bldg-ap)" />
        <rect x="461" y="84"  width="8"   height="32"  fill="url(#bldg-ap)" />
        <polygon points="465,19 466,84 464,84" fill="#03020a" />
        <rect x="457" y="109" width="16" height="7" fill="#060412" />
        <rect x="455" y="116" width="20" height="6" fill="#060412" />
        <rect x="453" y="122" width="24" height="4" fill="#060412" />
        <rect x="550" y="497" width="100" height="103" fill="url(#bldg-ap)" />
        <rect x="558" y="446" width="84"  height="51"  fill="url(#bldg-ap)" />
        <rect x="570" y="394" width="60"  height="52"  fill="url(#bldg-ap)" />
        <rect x="582" y="347" width="36"  height="47"  fill="url(#bldg-ap)" />
        <rect x="590" y="291" width="20"  height="56"  fill="url(#bldg-ap)" />
        <rect x="593" y="225" width="14"  height="66"  fill="url(#bldg-ap)" />
        <polygon points="600,165 601,225 599,225" fill="#03020a" />
        <rect x="680" y="516" width="120" height="84"  fill="url(#bldg-ap)" />
        <rect x="688" y="459" width="104" height="57"  fill="url(#bldg-ap)" />
        <rect x="700" y="403" width="80"  height="56"  fill="url(#bldg-ap)" />
        <rect x="712" y="347" width="56"  height="56"  fill="url(#bldg-ap)" />
        <rect x="722" y="291" width="36"  height="56"  fill="url(#bldg-ap)" />
        <rect x="730" y="225" width="20"  height="66"  fill="url(#bldg-ap)" />
        <rect x="733" y="178" width="14"  height="47"  fill="url(#bldg-ap)" />
        <polygon points="740,116 741,178 739,178" fill="#03020a" />
        <rect x="820" y="484" width="140" height="116" fill="url(#bldg-ap)" />
        <rect x="832" y="431" width="116" height="53"  fill="url(#bldg-ap)" />
        <rect x="848" y="394" width="84"  height="37"  fill="url(#bldg-ap)" />
        <rect x="862" y="360" width="56"  height="34"  fill="url(#bldg-ap)" />
        <rect x="875" y="315" width="30"  height="45"  fill="url(#bldg-ap)" />
        <rect x="882" y="263" width="16"  height="52"  fill="url(#bldg-ap)" />
        <polygon points="890,210 891,263 889,263" fill="#03020a" />
        <rect x="980"  y="506" width="100" height="94"  fill="url(#bldg-ap)" />
        <rect x="988"  y="454" width="84"  height="52"  fill="url(#bldg-ap)" />
        <rect x="1000" y="403" width="60"  height="51"  fill="url(#bldg-ap)" />
        <rect x="1010" y="353" width="40"  height="50"  fill="url(#bldg-ap)" />
        <rect x="1018" y="296" width="24"  height="57"  fill="url(#bldg-ap)" />
        <rect x="1023" y="240" width="14"  height="56"  fill="url(#bldg-ap)" />
        <rect x="1025" y="197" width="10"  height="43"  fill="url(#bldg-ap)" />
        <polygon points="1030,135 1031,197 1029,197" fill="#03020a" />
        <rect x="1100" y="497" width="340" height="103" fill="url(#bldg-ap)" />
        <rect x="1115" y="450" width="310" height="47"  fill="url(#bldg-ap)" />
        <rect x="1140" y="409" width="260" height="41"  fill="url(#bldg-ap)" />
        <rect x="1180" y="366" width="180" height="43"  fill="url(#bldg-ap)" />
        <rect x="1210" y="328" width="120" height="38"  fill="url(#bldg-ap)" />
        <rect x="1240" y="291" width="60"  height="37"  fill="url(#bldg-ap)" />
        <rect x="1252" y="248" width="36"  height="43"  fill="url(#bldg-ap)" />
        <rect x="1262" y="206" width="16"  height="42"  fill="url(#bldg-ap)" />
        <polygon points="1270,146 1271,206 1269,206" fill="#03020a" />
        <rect x="0" y="572" width="1440" height="28" fill="#02010a" opacity="0.9" />
      </svg>

      {/* スキャンライン */}
      <div className="absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.010) 0px, rgba(0,0,0,0.010) 1px, transparent 1px, transparent 4px)",
      }} />

      {/* 上部グラデーションライン */}
      <div className="absolute inset-x-0 top-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(220,160,40,0.5), rgba(0,210,230,0.3), transparent)",
      }} />
    </>
  )
}

export default function GuidePage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen" style={{ background: "#09060f" }}>
      {/* 背景 fixed — 他ページと同じ構造 */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <ApartmentBackground />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 px-6 py-12">
        <div className="mx-auto max-w-2xl">

          {/* 戻るボタン */}
          <button onClick={() => router.push("/")}
            className="mb-10 flex items-center gap-2 text-[11px] text-white/25 transition-colors hover:text-white/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            トップに戻る
          </button>

          {/* ヘッダー */}
          <motion.div {...SECTION_FADE} transition={{ duration: 0.5 }} className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-terminal-amber" />
              <span className="text-[9px] font-bold tracking-[0.3em] text-terminal-amber">MUST READ</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white">
              トレードを始める前に、<br />必ず読んでください。
            </h1>
            <p className="text-sm leading-relaxed text-white/60">
              FXで失敗する人の共通点と、Mundelがそれをどう解決するか。
            </p>
          </motion.div>

          {/* Section 1: よくある失敗 */}
          <motion.section {...SECTION_FADE} transition={{ duration: 0.5, delay: 0.1 }} className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-terminal-red" />
              <h2 className="text-[11px] font-bold tracking-[0.2em] text-terminal-red">FXで損をする人の共通点</h2>
            </div>
            <div className="rounded-xl border border-terminal-red/15 bg-black/40 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="mb-4 text-sm leading-relaxed text-white/75">
                FXで継続的に損をする人のほとんどは、<strong className="text-white/90">根拠のないトレード</strong>をしています。
                「なんとなく上がりそう」「ニュースで円安と言っていたから」という感覚だけでエントリーする。
                これは、経済の仕組みを理解せずに市場に参加していることを意味します。
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "チャートしか見ていない（マクロ経済を無視している）",
                  "ニュースを見ても、なぜ動くのかがわからない",
                  "短期の値動きに振り回され、大きな流れを見失う",
                  "シグナルツールに頼るだけで、根拠を理解しようとしない",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terminal-red/60" />
                    <span className="text-[12px] leading-relaxed text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Section 2: なぜマクロ経済が重要か */}
          <motion.section {...SECTION_FADE} transition={{ duration: 0.5, delay: 0.2 }} className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-terminal-cyan" />
              <h2 className="text-[11px] font-bold tracking-[0.2em] text-terminal-cyan">なぜマクロ経済を理解することが重要か</h2>
            </div>
            <div className="rounded-xl border border-terminal-cyan/15 bg-black/40 p-5" style={{ backdropFilter: "blur(12px)" }}>
              <p className="mb-4 text-[13px] leading-[1.85] text-white/75">
                FXの大きなトレンドは、<strong className="text-white/85">マクロ経済の変化</strong>によって動きます。
                金利差、資本フロー、財政政策——これらが為替レートの方向性を決める根本的な力です。
              </p>
              <p className="mb-4 text-[13px] leading-[1.85] text-white/75">
                スキャルピング（秒〜分単位の超短期取引）はテクニカル分析が中心ですが、
                <strong className="text-white/90">スイング・ポジショントレード（日〜週単位）</strong>では
                マクロ経済の読み方が勝敗を分けます。
              </p>
              <p className="text-[13px] leading-[1.85] text-white/75">
                Mundelが使う<strong className="text-white/90">IS-LM-BPモデル</strong>は、
                財政政策・金融政策・国際資本移動が為替に与える影響を可視化する経済学のフレームワークです。
                このモデルを理解することで、「なぜ今の為替がこの水準にあるのか」を論理的に説明できるようになります。
              </p>
            </div>
          </motion.section>

          {/* Section 3: Mundelの使い方 */}
          <motion.section {...SECTION_FADE} transition={{ duration: 0.5, delay: 0.3 }} className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-terminal-green" />
              <h2 className="text-[11px] font-bold tracking-[0.2em] text-terminal-green">Mundelでの学び方</h2>
            </div>
            <div className="flex flex-col gap-3">
              {[
                {
                  step: "01",
                  title: "毎日1つのニュースを分析する習慣をつける",
                  body: "完璧に理解できなくてよい。「米利上げ → LM左シフト → 金利上昇 → 円安方向」という流れを繰り返し追うことで、自然に体に染み込みます。",
                },
                {
                  step: "02",
                  title: "グラフのシフトと均衡点の変化を読む",
                  body: "IS・LM・BP曲線がどの方向にどれだけ動いたか、均衡点がどう変化したかを確認する。各ラベルにホバーすると用語の説明が表示されます。",
                },
                {
                  step: "03",
                  title: "AIの解説と自分の予想を比較する",
                  body: "AIシグナルを見る前に「自分ならどう判断するか」を考えてみてください。正解より、考えるプロセスが重要です。",
                },
                {
                  step: "04",
                  title: "模擬トレードで根拠のあるエントリーを練習する",
                  body: "「このニュースでBUYエントリーする根拠は何か」を言語化してからポジションを建てる。クローズ後にAIがフィードバックをくれます。",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 rounded-xl border border-white/6 bg-black/40 p-4" style={{ backdropFilter: "blur(12px)" }}>
                  <span className="mt-0.5 shrink-0 text-[11px] font-bold tabular-nums text-terminal-green/40">{item.step}</span>
                  <div>
                    <p className="mb-1 text-[12px] font-bold text-white/70">{item.title}</p>
                    <p className="text-[11px] leading-relaxed text-white/65">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 4: 向き・不向き */}
          <motion.section {...SECTION_FADE} transition={{ duration: 0.5, delay: 0.4 }} className="mb-12">
            <h2 className="mb-4 text-[11px] font-bold tracking-[0.2em] text-white/55">MUNDELはこんな人に向いています</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-terminal-green/15 bg-black/40 p-4" style={{ backdropFilter: "blur(12px)" }}>
                <p className="mb-3 text-[9px] font-bold tracking-wider text-terminal-green/60">向いている</p>
                <div className="flex flex-col gap-2">
                  {[
                    "根拠を理解した上でFXをやりたい",
                    "経済ニュースの読み方を学びたい",
                    "スイング・ポジション取引を目指している",
                    "感覚ではなく論理で判断したい",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-terminal-green/60" />
                      <span className="text-[11px] text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-terminal-red/15 bg-black/40 p-4" style={{ backdropFilter: "blur(12px)" }}>
                <p className="mb-3 text-[9px] font-bold tracking-wider text-terminal-red/60">向いていない</p>
                <div className="flex flex-col gap-2">
                  {[
                    "楽して稼ぐ方法を探している",
                    "スキャルピングで勝ちたい",
                    "シグナルに従うだけでいい",
                    "勉強する時間を取りたくない",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <X className="mt-0.5 h-3 w-3 shrink-0 text-terminal-red/50" />
                      <span className="text-[11px] text-white/65">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div {...SECTION_FADE} transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-xl border border-terminal-green/20 bg-black/40 p-6 text-center"
            style={{ backdropFilter: "blur(12px)" }}
          >
            <p className="mb-2 text-sm font-bold text-white/70">準備できましたか？</p>
            <p className="mb-5 text-[11px] text-white/55">ステップ1から順番に学んでいきましょう。</p>
            <button onClick={() => router.push("/learn")}
              className="group inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold tracking-wide transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,128,0.15), rgba(0,180,216,0.10))",
                border: "1px solid rgba(0,255,128,0.3)",
                color: "rgba(0,255,180,0.95)",
                boxShadow: "0 0 24px rgba(0,255,128,0.08)",
              }}
            >
              学習を始める
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
