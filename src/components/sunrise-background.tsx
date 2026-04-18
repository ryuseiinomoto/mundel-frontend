"use client"

// 朝日カラーの窓光
const WINDOWS = [
  // 左ブロック — ウォームゴールド
  { x:3,  y:72, w:10, h:7,  c:"rgba(255,185,70,0.55)"  },
  { x:7,  y:72, w:8,  h:7,  c:"rgba(240,155,45,0.40)"  },
  { x:3,  y:63, w:8,  h:6,  c:"rgba(250,170,55,0.50)"  },
  { x:10, y:63, w:6,  h:6,  c:"rgba(220,130,35,0.38)"  },
  // 左タワー — ピンク寄り
  { x:17, y:52, w:6,  h:5,  c:"rgba(255,160,100,0.60)" },
  { x:21, y:52, w:6,  h:5,  c:"rgba(240,130,80,0.45)"  },
  { x:17, y:60, w:6,  h:5,  c:"rgba(255,170,90,0.55)"  },
  { x:23, y:43, w:5,  h:4,  c:"rgba(255,145,110,0.65)" },
  { x:19, y:35, w:4,  h:4,  c:"rgba(245,155,95,0.50)"  },
  // センタータワー — 最も明るい（ゴールデン）
  { x:47, y:28, w:7,  h:6,  c:"rgba(255,200,80,0.70)"  },
  { x:52, y:28, w:7,  h:6,  c:"rgba(245,180,60,0.60)"  },
  { x:47, y:38, w:7,  h:6,  c:"rgba(255,195,70,0.65)"  },
  { x:52, y:38, w:6,  h:6,  c:"rgba(230,160,50,0.50)"  },
  { x:49, y:48, w:5,  h:5,  c:"rgba(250,185,65,0.60)"  },
  { x:47, y:58, w:7,  h:6,  c:"rgba(240,170,55,0.55)"  },
  { x:54, y:58, w:6,  h:6,  c:"rgba(220,145,40,0.42)"  },
  // 右エリア — ローズ/サーモン
  { x:68, y:55, w:6,  h:5,  c:"rgba(255,160,110,0.55)" },
  { x:73, y:55, w:6,  h:5,  c:"rgba(240,140,90,0.45)"  },
  { x:68, y:63, w:8,  h:6,  c:"rgba(250,165,80,0.50)"  },
  { x:78, y:45, w:5,  h:5,  c:"rgba(255,175,100,0.60)" },
  { x:82, y:45, w:5,  h:5,  c:"rgba(240,155,80,0.50)"  },
  { x:78, y:53, w:5,  h:5,  c:"rgba(248,165,85,0.55)"  },
  { x:88, y:60, w:6,  h:5,  c:"rgba(235,145,70,0.45)"  },
  { x:93, y:68, w:8,  h:6,  c:"rgba(250,160,75,0.50)"  },
  // ネオンサイン — ラベンダー/ピンク
  { x:30, y:42, w:12, h:3,  c:"rgba(200,120,255,0.55)" },
  { x:62, y:50, w:10, h:3,  c:"rgba(230,100,220,0.50)" },
  { x:84, y:38, w:8,  h:3,  c:"rgba(210,110,255,0.48)" },
]

export function SunriseBackground() {
  return (
    <>
      {/* 朝日グラデーション空 */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: [
          // 水平線の強いサンライズグロー（中央下）
          "radial-gradient(ellipse 80% 45% at 50% 100%, rgba(240,130,40,0.75) 0%, transparent 62%)",
          // 左側の朝日広がり
          "radial-gradient(ellipse 45% 35% at 15% 90%, rgba(210,90,50,0.45) 0%, transparent 58%)",
          // 右側の朝日広がり
          "radial-gradient(ellipse 40% 30% at 85% 85%, rgba(200,80,80,0.38) 0%, transparent 55%)",
          // 上空からの朝焼け
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(80,20,100,0.35) 0%, transparent 60%)",
          // 空グラデーション（天頂→水平線）
          "linear-gradient(180deg, #070412 0%, #160828 18%, #2e1050 32%, #581845 46%, #90263a 60%, #c04828 73%, #d87030 82%, #070412 100%)",
        ].join(", "),
      }} />

      {/* アールデコ ダイヤモンドパターン（暖色） */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.045]" style={{
        backgroundImage: [
          "repeating-linear-gradient( 45deg, rgba(200,120,40,1) 0px, rgba(200,120,40,1) 1px, transparent 1px, transparent 36px)",
          "repeating-linear-gradient(-45deg, rgba(200,120,40,1) 0px, rgba(200,120,40,1) 1px, transparent 1px, transparent 36px)",
        ].join(", "),
      }} />

      {/* 朝日の光芒（薄いリング） */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2" style={{
        width: "160%",
        height: "60%",
        backgroundImage: [
          "repeating-conic-gradient(from 260deg at 50% 100%, rgba(240,160,40,0.04) 0deg, transparent 1.5deg, transparent 3deg)",
        ].join(", "),
      }} />

      {/* 窓の光 */}
      {WINDOWS.map((w, i) => (
        <div key={i} className="pointer-events-none absolute rounded-sm"
          style={{
            left: `${w.x}%`, top: `${w.y}%`,
            width: `${w.w * 0.6}%`, height: `${w.h * 0.5}%`,
            background: w.c,
            boxShadow: `0 0 ${w.c.includes("120,255") || w.c.includes("100,220") || w.c.includes("110,255") ? "18px 7px" : "12px 5px"} ${w.c}`,
            animation: w.c.includes("120,255") || w.c.includes("100,220") || w.c.includes("110,255")
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
          <linearGradient id="bldg-sr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c0514" />
            <stop offset="100%" stopColor="#07030d" />
          </linearGradient>
        </defs>

        {/* ── 左ブロック群 ── */}
        <rect x="0"   y="450" width="95"  height="150" fill="url(#bldg-sr)" />
        <rect x="5"   y="394" width="85"  height="56"  fill="url(#bldg-sr)" />
        <rect x="15"  y="353" width="65"  height="41"  fill="url(#bldg-sr)" />
        <rect x="28"  y="319" width="40"  height="34"  fill="url(#bldg-sr)" />
        <rect x="36"  y="278" width="24"  height="41"  fill="url(#bldg-sr)" />
        <rect x="42"  y="206" width="12"  height="72"  fill="url(#bldg-sr)" />
        <rect x="44"  y="178" width="8"   height="28"  fill="url(#bldg-sr)" />
        <polygon points="47,113 48,178 46,178" fill="#060210" />

        {/* ── 左中タワー ── */}
        <rect x="105" y="488" width="110" height="112" fill="url(#bldg-sr)" />
        <rect x="112" y="422" width="96"  height="66"  fill="url(#bldg-sr)" />
        <rect x="122" y="366" width="76"  height="56"  fill="url(#bldg-sr)" />
        <rect x="135" y="315" width="50"  height="51"  fill="url(#bldg-sr)" />
        <rect x="145" y="263" width="30"  height="52"  fill="url(#bldg-sr)" />
        <rect x="151" y="188" width="18"  height="75"  fill="url(#bldg-sr)" />
        <rect x="154" y="146" width="12"  height="42"  fill="url(#bldg-sr)" />
        <polygon points="160,79 162,146 158,146" fill="#060210" />
        <rect x="157" y="139" width="6"  height="7" fill="#080318" />
        <rect x="155" y="146" width="10" height="6" fill="#080318" />

        {/* ── 中央低層ブロック ── */}
        <rect x="230" y="506" width="160" height="94"  fill="url(#bldg-sr)" />
        <rect x="240" y="465" width="140" height="41"  fill="url(#bldg-sr)" />
        <rect x="260" y="431" width="100" height="34"  fill="url(#bldg-sr)" />

        {/* ── センタータワー ── */}
        <rect x="400" y="525" width="130" height="75"  fill="url(#bldg-sr)" />
        <rect x="408" y="465" width="114" height="60"  fill="url(#bldg-sr)" />
        <rect x="420" y="403" width="90"  height="62"  fill="url(#bldg-sr)" />
        <rect x="432" y="341" width="66"  height="62"  fill="url(#bldg-sr)" />
        <rect x="442" y="281" width="46"  height="60"  fill="url(#bldg-sr)" />
        <rect x="450" y="216" width="30"  height="65"  fill="url(#bldg-sr)" />
        <rect x="455" y="159" width="20"  height="57"  fill="url(#bldg-sr)" />
        <rect x="458" y="116" width="14"  height="43"  fill="url(#bldg-sr)" />
        <rect x="461" y="84"  width="8"   height="32"  fill="url(#bldg-sr)" />
        <polygon points="465,19 466,84 464,84" fill="#060210" />
        <rect x="457" y="109" width="16" height="7" fill="#080318" />
        <rect x="455" y="116" width="20" height="6" fill="#080318" />
        <rect x="453" y="122" width="24" height="4" fill="#080318" />

        {/* ── 中右エリア ── */}
        <rect x="550" y="497" width="100" height="103" fill="url(#bldg-sr)" />
        <rect x="558" y="446" width="84"  height="51"  fill="url(#bldg-sr)" />
        <rect x="570" y="394" width="60"  height="52"  fill="url(#bldg-sr)" />
        <rect x="582" y="347" width="36"  height="47"  fill="url(#bldg-sr)" />
        <rect x="590" y="291" width="20"  height="56"  fill="url(#bldg-sr)" />
        <rect x="593" y="225" width="14"  height="66"  fill="url(#bldg-sr)" />
        <polygon points="600,165 601,225 599,225" fill="#060210" />

        {/* ── 右タワー ── */}
        <rect x="680" y="516" width="120" height="84"  fill="url(#bldg-sr)" />
        <rect x="688" y="459" width="104" height="57"  fill="url(#bldg-sr)" />
        <rect x="700" y="403" width="80"  height="56"  fill="url(#bldg-sr)" />
        <rect x="712" y="347" width="56"  height="56"  fill="url(#bldg-sr)" />
        <rect x="722" y="291" width="36"  height="56"  fill="url(#bldg-sr)" />
        <rect x="730" y="225" width="20"  height="66"  fill="url(#bldg-sr)" />
        <rect x="733" y="178" width="14"  height="47"  fill="url(#bldg-sr)" />
        <polygon points="740,116 741,178 739,178" fill="#060210" />

        {/* ── 右低層群 ── */}
        <rect x="820" y="484" width="140" height="116" fill="url(#bldg-sr)" />
        <rect x="832" y="431" width="116" height="53"  fill="url(#bldg-sr)" />
        <rect x="848" y="394" width="84"  height="37"  fill="url(#bldg-sr)" />
        <rect x="862" y="360" width="56"  height="34"  fill="url(#bldg-sr)" />
        <rect x="875" y="315" width="30"  height="45"  fill="url(#bldg-sr)" />
        <rect x="882" y="263" width="16"  height="52"  fill="url(#bldg-sr)" />
        <polygon points="890,210 891,263 889,263" fill="#060210" />

        {/* ── 右端タワー ── */}
        <rect x="980"  y="506" width="100" height="94"  fill="url(#bldg-sr)" />
        <rect x="988"  y="454" width="84"  height="52"  fill="url(#bldg-sr)" />
        <rect x="1000" y="403" width="60"  height="51"  fill="url(#bldg-sr)" />
        <rect x="1010" y="353" width="40"  height="50"  fill="url(#bldg-sr)" />
        <rect x="1018" y="296" width="24"  height="57"  fill="url(#bldg-sr)" />
        <rect x="1023" y="240" width="14"  height="56"  fill="url(#bldg-sr)" />
        <rect x="1025" y="197" width="10"  height="43"  fill="url(#bldg-sr)" />
        <polygon points="1030,135 1031,197 1029,197" fill="#060210" />

        {/* ── 最右端ブロック ── */}
        <rect x="1100" y="497" width="340" height="103" fill="url(#bldg-sr)" />
        <rect x="1115" y="450" width="310" height="47"  fill="url(#bldg-sr)" />
        <rect x="1140" y="409" width="260" height="41"  fill="url(#bldg-sr)" />
        <rect x="1180" y="366" width="180" height="43"  fill="url(#bldg-sr)" />
        <rect x="1210" y="328" width="120" height="38"  fill="url(#bldg-sr)" />
        <rect x="1240" y="291" width="60"  height="37"  fill="url(#bldg-sr)" />
        <rect x="1252" y="248" width="36"  height="43"  fill="url(#bldg-sr)" />
        <rect x="1262" y="206" width="16"  height="42"  fill="url(#bldg-sr)" />
        <polygon points="1270,146 1271,206 1269,206" fill="#060210" />

        {/* 地面ベース */}
        <rect x="0" y="572" width="1440" height="28" fill="#040108" opacity="0.9" />
      </svg>

      {/* スキャンライン */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.010) 0px, rgba(0,0,0,0.010) 1px, transparent 1px, transparent 4px)",
      }} />

      {/* 上部グラデーションライン（ピンク〜ゴールド） */}
      <div className="absolute inset-x-0 top-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(200,80,160,0.5), rgba(240,150,40,0.4), transparent)",
      }} />
    </>
  )
}
