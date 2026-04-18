"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  RefreshCw,
  ArrowLeft,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Brain,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Newspaper,
  Bot,
} from "lucide-react"
import Link from "next/link"

// -------------------------------------------------------------------
// API
// -------------------------------------------------------------------
function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL
  if (env && env.trim()) return env.replace(/\/$/, "")
  if (typeof window === "undefined") return "http://localhost:8080"
  const h = window.location.hostname
  if (h === "localhost" || h === "127.0.0.1") return "http://localhost:8080"
  return "https://mundel-backend-490996932437.europe-west1.run.app"
}

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
interface Candle {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface Position {
  id: string
  action: "BUY" | "SELL"
  quantity: number
  entry_price: number
  entry_time: string
  current_price: number
  pnl: number
}

interface TradeState {
  balance: number
  positions: Position[]
  total_pnl: number
  current_price: number
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  mode: "analysis" | "chat"
  text: string
  signal?: "BUY" | "SELL" | "HOLD"
  signalReason?: string
  logicJp?: string
  shifts?: { is: number; lm: number; bp: number }
  detailOpen?: boolean
}

// -------------------------------------------------------------------
// Candlestick shape for Recharts
// -------------------------------------------------------------------
function CandlestickBar(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: Candle
  chartHeight?: number
  yMin?: number
  yMax?: number
}) {
  const { x = 0, width = 0, payload, chartHeight = 300, yMin = 0, yMax = 200 } = props
  if (!payload) return null

  const { open, close, high, low } = payload
  const range = yMax - yMin || 1
  const toY = (v: number) => ((yMax - v) / range) * chartHeight

  const isUp = close >= open
  const color = isUp ? "#ef4444" : "#22c55e"
  const bodyTop = toY(Math.max(open, close))
  const bodyBot = toY(Math.min(open, close))
  const bodyH = Math.max(bodyBot - bodyTop, 1)
  const wickX = x + width / 2
  const halfW = Math.max(width / 2 - 1, 1)

  return (
    <g>
      <line x1={wickX} y1={toY(high)} x2={wickX} y2={toY(low)} stroke={color} strokeWidth={1} />
      <rect
        x={x + width / 2 - halfW}
        y={bodyTop}
        width={halfW * 2}
        height={bodyH}
        fill={color}
        fillOpacity={isUp ? 0.85 : 1}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  )
}

// -------------------------------------------------------------------
// Custom tooltip
// -------------------------------------------------------------------
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Candle }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isUp = d.close >= d.open
  return (
    <div className="rounded-xl px-3 py-2 text-[11px]" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(5,14,28,0.95)" }}>
      <div className="mb-1 text-white/30">{d.date}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-white/35">O</span><span>{d.open.toFixed(3)}</span>
        <span className="text-white/35">H</span><span className="text-terminal-red">{d.high.toFixed(3)}</span>
        <span className="text-white/35">L</span><span className="text-terminal-green">{d.low.toFixed(3)}</span>
        <span className="text-white/35">C</span>
        <span className={isUp ? "font-bold text-terminal-red" : "font-bold text-terminal-green"}>{d.close.toFixed(3)}</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Live price ticker component
// -------------------------------------------------------------------
function LivePriceTicker({ price, prevPrice }: { price: number; prevPrice: number }) {
  const up = price >= prevPrice
  const diff = price - prevPrice
  const pct = prevPrice ? ((diff / prevPrice) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <motion.span
        key={price.toFixed(3)}
        initial={{ opacity: 0.4, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className={`text-[20px] font-bold tabular-nums ${up ? "text-terminal-green" : "text-terminal-red"}`}
      >
        {price.toFixed(3)}
      </motion.span>
      <span className="text-[10px] text-white/30">JPY</span>
      <motion.span
        key={`diff-${price.toFixed(3)}`}
        initial={{ opacity: 0, y: up ? 4 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? "text-terminal-green" : "text-terminal-red"}`}
      >
        {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(diff).toFixed(3)} ({pct >= 0 ? "+" : ""}{pct.toFixed(3)}%)
      </motion.span>
    </div>
  )
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------
export default function TradePage() {
  const apiBase = getApiBase()

  const [candles, setCandles] = useState<Candle[]>([])
  const [basePrice, setBasePrice] = useState<number>(0)       // yfinanceから取得した実際の価格
  const [livePrice, setLivePrice] = useState<number>(0)       // シミュレーション中のライブ価格
  const [prevLivePrice, setPrevLivePrice] = useState<number>(0)
  const [tradeState, setTradeState] = useState<TradeState | null>(null)
  // フロントエンドで残高・エントリー価格を管理（バックエンドのキャッシュ価格に依存しない）
  const [localBalance, setLocalBalance] = useState<number | null>(null)
  const [localEntries, setLocalEntries] = useState<Record<string, number>>({}) // posId → entry_price at open
  const [quantity, setQuantity] = useState<string>("100")
  const [isLoadingChart, setIsLoadingChart] = useState(true)
  const [isLoadingTrade, setIsLoadingTrade] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [tradeFeedback, setTradeFeedback] = useState<{ pnl: number; feedback: string } | null>(null)
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false)
  const [chartDimensions, setChartDimensions] = useState({ height: 300, yMin: 140, yMax: 165 })
  const [chartCandles, setChartCandles] = useState<Candle[]>([])  // ライブローソク足付き
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(60)

  // AI Advisor chat state
  const [analysisMessages, setAnalysisMessages] = useState<ChatMessage[]>([])
  const [fxMessages, setFxMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatMode, setChatMode] = useState<"analysis" | "chat">("analysis")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const driftRef = useRef(0) // ランダムウォークのドリフト

  // -------------------------------------------------------------------
  // Fetch chart (5分足)
  // -------------------------------------------------------------------
  const fetchChart = useCallback(async () => {
    setIsLoadingChart(true)
    try {
      const res = await fetch(`${apiBase}/api/trade/chart`)
      if (!res.ok) return
      const data = await res.json()
      const c: Candle[] = data.candles ?? []
      setCandles(c)
      const price = data.current_price ?? c[c.length - 1]?.close ?? 0
      setBasePrice(price)
      setLivePrice(price)
      setPrevLivePrice(price)
      driftRef.current = 0
      if (c.length > 0) {
        const allLows = c.map((x) => x.low)
        const allHighs = c.map((x) => x.high)
        const spread = Math.max(...allHighs) - Math.min(...allLows)
        const yMin = Math.min(...allLows) - spread * 0.05
        const yMax = Math.max(...allHighs) + spread * 0.05
        setChartDimensions((prev) => ({ ...prev, yMin, yMax }))
      }
      setLastRefresh(new Date())
      setCountdown(60)
    } catch {
      // silent
    } finally {
      setIsLoadingChart(false)
    }
  }, [apiBase])

  const fetchTradeState = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/trade`)
      if (!res.ok) return
      const data: TradeState = await res.json()
      setTradeState(data)
    } catch {
      // silent
    }
  }, [apiBase])

  // 初回取得
  useEffect(() => {
    fetchChart()
    fetchTradeState()
  }, [fetchChart, fetchTradeState])

  // API から残高を初期化（初回のみ）
  useEffect(() => {
    if (tradeState && localBalance === null) {
      setLocalBalance(tradeState.balance)
    }
  }, [tradeState, localBalance])

  // -------------------------------------------------------------------
  // 60秒ごとにチャート自動更新 + カウントダウン
  // -------------------------------------------------------------------
  useEffect(() => {
    const chartTimer = setInterval(() => {
      fetchChart()
      fetchTradeState()
    }, 60_000)
    return () => clearInterval(chartTimer)
  }, [fetchChart, fetchTradeState])

  useEffect(() => {
    const cd = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 60 : prev - 1))
    }, 1000)
    return () => clearInterval(cd)
  }, [])

  // チャット末尾へ自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [analysisMessages, fxMessages])

  // -------------------------------------------------------------------
  // ライブ価格シミュレーション（2秒ごと）
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!basePrice) return

    const tick = setInterval(() => {
      setLivePrice((prev) => {
        // ランダムウォーク: わずかなドリフト + ノイズ
        // JPY/USDは1分に0.01〜0.05程度動く → 2秒で±0.005〜0.015
        const noise = (Math.random() - 0.5) * 0.03
        // ドリフト: basePrice方向への引力（±0.3以上離れたら戻す）
        const distance = prev - basePrice
        const drift = distance > 0.3 ? -0.003 : distance < -0.3 ? 0.003 : (Math.random() - 0.49) * 0.005
        const next = prev + noise + drift
        setPrevLivePrice(prev)
        return Math.round(next * 1000) / 1000
      })
    }, 2000)

    return () => clearInterval(tick)
  }, [basePrice])

  // -------------------------------------------------------------------
  // ライブ価格でチャートの最終ローソク足を更新
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!candles.length || !livePrice) {
      setChartCandles(candles)
      return
    }
    const base = candles[candles.length - 1]
    const updatedLast: Candle = {
      ...base,
      high: Math.max(base.high, livePrice),
      low: Math.min(base.low, livePrice),
      close: livePrice,
    }
    setChartCandles([...candles.slice(0, -1), updatedLast])
  }, [candles, livePrice])

  // -------------------------------------------------------------------
  // Trade handlers
  // -------------------------------------------------------------------
  const handleTrade = async (action: "BUY" | "SELL") => {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) { setError("数量を正しく入力してください"); return }
    setIsLoadingTrade(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`${apiBase}/api/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, quantity: qty, entry_price: livePrice }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail ?? "トレードに失敗しました")
      } else {
        // フロントで残高を即時更新（バックエンドのキャッシュ価格に依存しない）
        setLocalBalance((prev) => (prev ?? 10000) - qty)
        // エントリー価格を livePrice で記録
        const posId: string = data.position?.id
        if (posId) {
          setLocalEntries((prev) => ({ ...prev, [posId]: livePrice }))
        }
        setSuccessMsg(data.message)
        await fetchTradeState()
      }
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setIsLoadingTrade(false)
    }
  }

  const handleClose = async (posId: string, pos: Position) => {
    setIsLoadingTrade(true)
    setError(null)
    setSuccessMsg(null)
    setTradeFeedback(null)
    try {
      const res = await fetch(`${apiBase}/api/trade/${posId}?close_price=${livePrice}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail ?? "クローズに失敗しました")
      } else {
        // フロントで PnL を計算（バックエンドのキャッシュ価格に依存しない）
        const entryPrice = localEntries[posId] ?? pos.entry_price
        const closePnl = pos.action === "BUY"
          ? (livePrice - entryPrice) * pos.quantity / entryPrice
          : (entryPrice - livePrice) * pos.quantity / entryPrice
        setLocalBalance((prev) => (prev ?? 10000) + pos.quantity + closePnl)
        setLocalEntries((prev) => { const next = { ...prev }; delete next[posId]; return next })
        const s = closePnl >= 0 ? "+" : ""
        const newBal = (localBalance ?? 10000) + pos.quantity + closePnl
        setSuccessMsg(`クローズ完了（損益: ${s}$${closePnl.toFixed(2)} → 残高: $${newBal.toFixed(2)}）`)
        await fetchTradeState()

        // AI学習フィードバックを非同期で取得
        setIsFeedbackLoading(true)
        const closePrice: number = data.close_price ?? livePrice
        const direction = data.pnl >= 0 ? "利益" : "損失"
        const prompt = `USD/JPYの模擬トレードで${pos.action}ポジションをエントリー価格${pos.entry_price.toFixed(3)}円で建て、${closePrice.toFixed(3)}円でクローズしました。結果は${s}$${data.pnl.toFixed(2)}の${direction}でした。このトレード結果から、FXを学んでいる初心者がマクロ経済・IS-LM-BPモデルの観点で学べることを日本語で3〜4文で教えてください。`
        try {
          const chatRes = await fetch(`${apiBase}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt }),
          })
          if (chatRes.ok) {
            const chatData = await chatRes.json()
            setTradeFeedback({ pnl: data.pnl, feedback: chatData.answer ?? "" })
          }
        } catch { /* フィードバック取得失敗は無視 */ }
        finally { setIsFeedbackLoading(false) }
      }
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setIsLoadingTrade(false)
    }
  }

  const handleSend = async () => {
    if (!chatInput.trim() || isAiLoading) return
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      mode: chatMode,
      text: chatInput.trim(),
    }
    const setMessages = chatMode === "analysis" ? setAnalysisMessages : setFxMessages
    setMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setIsAiLoading(true)
    try {
      if (chatMode === "analysis") {
        const res = await fetch(`${apiBase}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ news_text: userMsg.text }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const sig = String(data.signal ?? "HOLD").toUpperCase() as "BUY" | "SELL" | "HOLD"
        const reason = data.signal_reason || data.analysis?.logic_jp || ""
        setAnalysisMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          mode: "analysis",
          text: reason,
          signal: sig,
          signalReason: reason,
          logicJp: data.analysis?.logic_jp ?? "",
          shifts: {
            is: Number(data.is_shift ?? 0),
            lm: Number(data.lm_shift ?? 0),
            bp: Number(data.bp_shift ?? 0),
          },
          detailOpen: false,
        }])
      } else {
        const res = await fetch(`${apiBase}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg.text }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setFxMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          mode: "chat",
          text: data.answer ?? "回答を生成できませんでした。",
        }])
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        mode: chatMode,
        text: err instanceof Error ? `エラー: ${err.message}` : "エラーが発生しました。もう一度お試しください。",
      }
      if (chatMode === "analysis") {
        setAnalysisMessages((prev) => [...prev, errMsg])
      } else {
        setFxMessages((prev) => [...prev, errMsg])
      }
    } finally {
      setIsAiLoading(false)
    }
  }

  const toggleDetail = (id: string) => {
    setAnalysisMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, detailOpen: !m.detailOpen } : m)
    )
  }

  const handleReset = async () => {
    if (!confirm("トレード履歴をリセットしますか？残高が$10,000に戻ります。")) return
    await fetch(`${apiBase}/api/trade/reset`, { method: "POST" })
    setLocalBalance(10000)
    setLocalEntries({})
    setSuccessMsg("リセットしました")
    await fetchTradeState()
  }

  // 最新のAIシグナル（BUYボタン等のハイライトに使用）
  const latestSignal = [...analysisMessages].reverse().find(
    (m) => m.role === "assistant" && m.signal
  )?.signal ?? null

  // ポジションの含み損益をライブ価格で再計算
  const positionsWithLivePnl = (tradeState?.positions ?? []).map((pos) => {
    const price = livePrice || pos.current_price
    // localEntries に記録された livePrice 時点のエントリー価格を優先
    const entry = localEntries[pos.id] ?? pos.entry_price
    const pnl = pos.action === "BUY"
      ? (price - entry) * pos.quantity / entry
      : (entry - price) * pos.quantity / entry
    return { ...pos, entry_price: entry, current_price: price, pnl: Math.round(pnl * 100) / 100 }
  })
  const totalPnl = positionsWithLivePnl.reduce((s, p) => s + p.pnl, 0)

  return (
    <div className="flex h-screen flex-col font-mono" style={{ background: ["radial-gradient(ellipse 60% 50% at 15% 60%, rgba(0,140,200,0.08) 0%, transparent 55%)","radial-gradient(ellipse 50% 40% at 85% 20%, rgba(180,130,20,0.07) 0%, transparent 50%)","#071e30"].join(", ") }}>
      {/* 上部ライン */}
      <div className="absolute inset-x-0 top-0 h-px z-10" style={{
        background: "linear-gradient(90deg, transparent, rgba(0,160,220,0.5), rgba(180,130,30,0.3), transparent)",
      }} />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/6 px-5 py-2" style={{ background: "rgba(5,14,28,0.92)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-white/25 transition-colors hover:text-white/50">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-[11px] tracking-wider">BACK</span>
          </Link>
          <span className="text-white/15">|</span>
          <Zap className="h-4 w-4 text-terminal-green" />
          <span className="text-[13px] font-bold tracking-[0.2em] text-terminal-green">MUNDEL</span>
          <span className="text-[11px] tracking-wider" style={{ color: "rgba(255,255,255,0.72)" }}>PAPER TRADE // USD/JPY 5M</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Live price in header */}
          {livePrice > 0 && (
            <LivePriceTicker price={livePrice} prevPrice={prevLivePrice} />
          )}
          <div className="flex items-center gap-1.5 text-[10px] text-white/25">
            <RefreshCw className={`h-2.5 w-2.5 ${isLoadingChart ? "animate-spin text-terminal-amber" : ""}`} />
            <span>{countdown}s</span>
          </div>
          <button
            onClick={() => { fetchChart(); fetchTradeState() }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
          >
            <RefreshCw className="h-3 w-3" />
            REFRESH
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chart + Trade Form */}
        <div className="flex w-[65%] flex-col border-r border-white/6">
          {/* Chart area */}
          <div className="flex flex-1 flex-col">
            {/* Chart header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/6 px-4 py-1.5" style={{ background: "rgba(5,14,28,0.5)" }}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/30">USD/JPY</span>
                <span className="rounded bg-terminal-amber/10 px-1.5 py-0.5 text-[9px] font-bold text-terminal-amber">5M</span>
                {lastRefresh && (
                  <span className="text-[9px] text-white/20">
                    更新: {lastRefresh.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>
              {/* Chart legend */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-[9px] text-white/30">
                  <span className="inline-block h-2 w-3 rounded-sm bg-terminal-red/80" />赤=陽線
                </span>
                <span className="flex items-center gap-1 text-[9px] text-white/30">
                  <span className="inline-block h-2 w-3 rounded-sm bg-terminal-green/80" />緑=陰線
                </span>
                <span className="flex items-center gap-1 text-[9px] text-white/30">
                  <span className="inline-block w-4 border-t border-dashed border-terminal-amber" />現在値
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="min-h-0 flex-1 px-2 py-2">
              {chartCandles.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartCandles} margin={{ top: 4, right: 56, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => v.slice(-5)}
                      tick={{ fill: "rgba(255,255,255,0.68)", fontSize: 8 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                      interval={Math.max(1, Math.floor(chartCandles.length / 8))}
                    />
                    <YAxis
                      domain={[chartDimensions.yMin, chartDimensions.yMax]}
                      tick={{ fill: "rgba(255,255,255,0.68)", fontSize: 8 }}
                      tickLine={false}
                      axisLine={false}
                      width={46}
                      tickFormatter={(v: number) => v.toFixed(2)}
                      tickCount={6}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    {livePrice > 0 && (
                      <ReferenceLine
                        y={livePrice}
                        stroke="#eab308"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{
                          value: livePrice.toFixed(3),
                          fill: "#eab308",
                          fontSize: 9,
                          position: "right",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                    {/* エントリー価格ライン — ラベルは左内側に表示して右側の重なりを防ぐ */}
                    {positionsWithLivePnl.map((pos) => (
                      <ReferenceLine
                        key={pos.id}
                        y={pos.entry_price}
                        stroke={pos.action === "BUY" ? "#22c55e" : "#ef4444"}
                        strokeDasharray="2 4"
                        strokeWidth={1}
                        strokeOpacity={0.5}
                        label={{
                          value: `${pos.action} ${pos.entry_price.toFixed(3)}`,
                          fill: pos.action === "BUY" ? "#22c55e" : "#ef4444",
                          fontSize: 8,
                          position: "insideTopLeft",
                          offset: 4,
                        }}
                      />
                    ))}
                    <Bar
                      dataKey="high"
                      shape={(p: unknown) => (
                        <CandlestickBar
                          {...(p as Record<string, unknown>)}
                          chartHeight={chartDimensions.height}
                          yMin={chartDimensions.yMin}
                          yMax={chartDimensions.yMax}
                        />
                      )}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="animate-pulse text-[11px] text-terminal-amber">チャートデータを取得中...</span>
                </div>
              )}
            </div>
          </div>

          {/* Trade Form */}
          <div className="shrink-0 border-t border-white/6 px-5 py-3" style={{ background: "rgba(5,14,28,0.6)" }}>
            <div className="flex items-end gap-3 flex-wrap">
              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-wider" style={{ color: "rgba(255,255,255,0.60)" }}>
                  取引金額（ドル）
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-28 rounded-lg px-3 py-1.5 text-[12px] font-mono outline-none transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.8)" }}
                />
                <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  例：100 = 100ドル分を売買
                </span>
              </div>

              {/* Quick amounts */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-wider text-white/30">クイック選択</label>
                <div className="flex gap-1.5">
                  {[100, 500, 1000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setQuantity(String(v))}
                      className="rounded-lg px-2 py-1.5 text-[10px] transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* BUY / SELL */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <div className="relative">
                    {latestSignal === "BUY" && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-terminal-green px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-background">
                        AI推奨
                      </span>
                    )}
                    <motion.button
                      onClick={() => handleTrade("BUY")}
                      disabled={isLoadingTrade}
                      animate={latestSignal === "BUY" ? { boxShadow: ["0 0 0px #22c55e00", "0 0 12px #22c55e88", "0 0 0px #22c55e00"] } : {}}
                      transition={latestSignal === "BUY" ? { repeat: Infinity, duration: 1.6 } : {}}
                      className={`flex items-center gap-2 rounded border px-6 py-2 text-[12px] font-bold tracking-[0.15em] text-terminal-green transition-colors hover:bg-terminal-green/20 disabled:opacity-40 ${
                        latestSignal === "BUY"
                          ? "border-terminal-green bg-terminal-green/20"
                          : "border-terminal-green/50 bg-terminal-green/10"
                      }`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      BUY
                    </motion.button>
                  </div>
                  <div className="relative">
                    {latestSignal === "SELL" && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-terminal-red px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-background">
                        AI推奨
                      </span>
                    )}
                    <motion.button
                      onClick={() => handleTrade("SELL")}
                      disabled={isLoadingTrade}
                      animate={latestSignal === "SELL" ? { boxShadow: ["0 0 0px #ef444400", "0 0 12px #ef444488", "0 0 0px #ef444400"] } : {}}
                      transition={latestSignal === "SELL" ? { repeat: Infinity, duration: 1.6 } : {}}
                      className={`flex items-center gap-2 rounded border px-6 py-2 text-[12px] font-bold tracking-[0.15em] text-terminal-red transition-colors hover:bg-terminal-red/20 disabled:opacity-40 ${
                        latestSignal === "SELL"
                          ? "border-terminal-red bg-terminal-red/20"
                          : "border-terminal-red/50 bg-terminal-red/10"
                      }`}
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      SELL
                    </motion.button>
                  </div>
                </div>
                <div className="flex gap-2 text-[9px] text-white/25">
                  <span className="w-[76px] text-center">円安予想のとき</span>
                  <span className="w-[76px] text-center">円高予想のとき</span>
                </div>
              </div>

              {/* Current price */}
              {livePrice > 0 && (
                <div className="ml-auto flex flex-col items-end gap-0.5">
                  <span className="text-[9px] tracking-wider text-white/30">EXECUTE PRICE</span>
                  <span className={`text-[15px] font-bold tabular-nums ${livePrice >= prevLivePrice ? "text-terminal-green" : "text-terminal-red"}`}>
                    {livePrice.toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            {/* P&L Simulation preview */}
            {livePrice > 0 && parseFloat(quantity) > 0 && (
              <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-1.5 flex-wrap"
                style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-[9px] tracking-wider text-white/25">シミュレーション</span>
                <span className="text-[9px] text-white/30">
                  1pip動くと
                  <span className="ml-1 font-bold tabular-nums text-terminal-amber">
                    ±${(0.01 * parseFloat(quantity) / livePrice).toFixed(3)}
                  </span>
                </span>
                <span className="text-[9px] text-white/30">
                  +1%上昇なら
                  <span className="ml-1 font-bold tabular-nums text-terminal-green">
                    +${(0.01 * parseFloat(quantity)).toFixed(2)}
                  </span>
                </span>
                <span className="text-[9px] text-white/30">
                  -1%下落なら
                  <span className="ml-1 font-bold tabular-nums text-terminal-red">
                    -${(0.01 * parseFloat(quantity)).toFixed(2)}
                  </span>
                </span>
              </div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-xl px-3 py-1.5 text-[11px]" style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "rgba(239,68,68,0.9)" }}
                >{error}</motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-xl px-3 py-1.5 text-[11px]" style={{ border: "1px solid rgba(0,255,128,0.2)", background: "rgba(0,255,128,0.05)", color: "rgba(0,255,128,0.9)" }}
                >{successMsg}</motion.div>
              )}
              {(isFeedbackLoading || tradeFeedback) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded border border-terminal-cyan/20 bg-terminal-cyan/[0.04] p-3"
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    {isFeedbackLoading
                      ? <Loader2 className="h-3 w-3 animate-spin text-terminal-cyan" />
                      : <Brain className="h-3 w-3 text-terminal-cyan" />
                    }
                    <span className="text-[9px] font-bold tracking-wider text-terminal-cyan">
                      {isFeedbackLoading ? "AIが分析中..." : "このトレードから学べること"}
                    </span>
                  </div>
                  {tradeFeedback && (
                    <p className="text-[11px] leading-relaxed text-white/70">{tradeFeedback.feedback}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Account + Positions */}
        <div className="flex w-[35%] flex-col overflow-hidden">
          {/* Account summary */}
          <div className="shrink-0 border-b border-white/6 px-5 py-3" style={{ background: "rgba(5,14,28,0.7)" }}>
            <div className="mb-2 text-[9px] tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.75)" }}>DEMO ACCOUNT</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-0.5 text-[9px] text-white/30">利用可能残高</div>
                <div className="text-[20px] font-bold text-terminal-green">
                  ${(localBalance ?? tradeState?.balance ?? 10000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-0.5 text-[9px] text-white/30">含み損益 (LIVE)</div>
                <motion.div
                  key={totalPnl.toFixed(2)}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className={`text-[16px] font-bold tabular-nums ${totalPnl >= 0 ? "text-terminal-green" : "text-terminal-red"}`}
                >
                  {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                </motion.div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] text-white/30">
                ポジション: <span className="text-white/80">{positionsWithLivePnl.length}</span>
              </span>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9px] transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
              >
                <RotateCcw className="h-2.5 w-2.5" />RESET
              </button>
            </div>
          </div>

          {/* AI ADVISOR — core feature */}
          <div className="flex flex-1 flex-col overflow-hidden border-b border-white/6">
            {/* Prominent header */}
            <div className="shrink-0 border-b border-white/6 px-4 py-2.5" style={{ background: "rgba(0,180,216,0.06)" }}>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="h-4 w-4 text-terminal-cyan" />
                </motion.div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-terminal-cyan">AI ADVISOR</span>
                <span className="rounded border border-terminal-cyan/40 bg-terminal-cyan/10 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-terminal-cyan">
                  GEMINI
                </span>
                {latestSignal && (
                  <span className={`ml-auto rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                    latestSignal === "BUY" ? "bg-terminal-green/15 text-terminal-green" :
                    latestSignal === "SELL" ? "bg-terminal-red/15 text-terminal-red" :
                    "bg-terminal-amber/15 text-terminal-amber"
                  }`}>{latestSignal}</span>
                )}
              </div>
              <p className="mt-0.5 text-[9px] text-terminal-cyan/50 tracking-wider">
                ニュース分析 · FX質問 · IS-LM-BP解析 — このアプリのコア機能
              </p>
            </div>

            {/* Mode tabs */}
            <div className="shrink-0 flex border-b border-white/6">
              <button
                onClick={() => setChatMode("analysis")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-bold tracking-wider transition-colors ${
                  chatMode === "analysis"
                    ? "border-b-2 border-terminal-cyan text-terminal-cyan"
                    : "text-white/30 hover:text-white/80"
                }`}
              >
                <Newspaper className="h-3 w-3" />
                ニュース分析
              </button>
              <button
                onClick={() => setChatMode("chat")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-bold tracking-wider transition-colors ${
                  chatMode === "chat"
                    ? "border-b-2 border-terminal-cyan text-terminal-cyan"
                    : "text-white/30 hover:text-white/80"
                }`}
              >
                <MessageCircle className="h-3 w-3" />
                FX質問
              </button>
            </div>

            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2" style={{ background: "rgba(5,14,28,0.3)" }}>
              {(chatMode === "analysis" ? analysisMessages : fxMessages).length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center">
                  <Bot className="h-8 w-8 text-terminal-cyan/20" />
                  {chatMode === "analysis" ? (
                    <>
                      <p className="text-[10px] text-white/25">ニュースや経済指標を入力してください</p>
                      <p className="text-[9px] text-white/20">例: FRBが0.25%の利上げを決定</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-white/25">FXについて何でも聞いてください</p>
                      <p className="text-[9px] text-white/20">例: ローソク足の見方を教えて</p>
                    </>
                  )}
                </div>
              )}
              {(chatMode === "analysis" ? analysisMessages : fxMessages).map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] rounded-xl rounded-tr-sm px-3 py-2" style={{ border: "1px solid rgba(0,210,230,0.2)", background: "rgba(0,210,230,0.08)" }}>
                      <p className="text-[10px] text-white/90 leading-relaxed">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="max-w-[90%] flex flex-col gap-1.5">
                      <div className="rounded-xl rounded-tl-sm px-3 py-2" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                        {/* Signal badge for analysis responses */}
                        {msg.signal && (
                          <div className={`mb-2 flex items-center justify-between rounded border px-3 py-1.5 ${
                            msg.signal === "BUY" ? "border-terminal-green/40 bg-terminal-green/8" :
                            msg.signal === "SELL" ? "border-terminal-red/40 bg-terminal-red/8" :
                            "border-terminal-amber/40 bg-terminal-amber/8"
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {msg.signal === "BUY" ? <TrendingUp className="h-3.5 w-3.5 text-terminal-green" /> :
                               msg.signal === "SELL" ? <TrendingDown className="h-3.5 w-3.5 text-terminal-red" /> :
                               <Activity className="h-3.5 w-3.5 text-terminal-amber" />}
                              <span className="text-[9px] text-white/30">AI SIGNAL</span>
                            </div>
                            <span className={`text-[16px] font-bold tracking-[0.2em] ${
                              msg.signal === "BUY" ? "text-terminal-green" :
                              msg.signal === "SELL" ? "text-terminal-red" :
                              "text-terminal-amber"
                            }`}>{msg.signal}</span>
                            <span className={`text-[9px] ${
                              msg.signal === "BUY" ? "text-terminal-green/70" :
                              msg.signal === "SELL" ? "text-terminal-red/70" :
                              "text-terminal-amber/70"
                            }`}>
                              {msg.signal === "BUY" ? "買い" : msg.signal === "SELL" ? "売り" : "様子見"}
                            </span>
                          </div>
                        )}
                        {/* IS/LM/BP bars */}
                        {msg.shifts && (
                          <div className="mb-2 flex gap-3">
                            {([
                              { label: "IS", val: msg.shifts.is, color: "#22c55e", invert: false },
                              { label: "LM", val: msg.shifts.lm, color: "#eab308", invert: true },
                              { label: "BP", val: msg.shifts.bp, color: "#06b6d4", invert: false },
                            ] as { label: string; val: number; color: string; invert: boolean }[]).map(({ label, val, color, invert }) => {
                              const dir = invert
                                ? (val > 0 ? "←" : val < 0 ? "→" : "—")
                                : (val > 0 ? "→" : val < 0 ? "←" : "—")
                              return (
                                <div key={label} className="flex flex-1 flex-col gap-0.5">
                                  <div className="flex justify-between">
                                    <span className="text-[8px] font-bold" style={{ color }}>{label}</span>
                                    <span className="text-[8px] text-white/30">{dir}</span>
                                  </div>
                                  <div className="h-1 w-full overflow-hidden rounded-full bg-border/40">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(Math.abs(val) * 10, 100)}%` }}
                                      transition={{ duration: 0.5 }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {/* Main text — signalReason for analysis, text for chat/error */}
                        {(msg.signalReason || (!msg.signal && msg.text)) && (
                          <p className="text-[10px] leading-relaxed text-white/80">
                            {msg.signalReason || msg.text}
                          </p>
                        )}
                        {/* Expandable detail */}
                        {msg.logicJp && (
                          <div className="mt-1.5">
                            <button
                              onClick={() => toggleDetail(msg.id)}
                              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[9px] transition-colors" style={{ border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}
                            >
                              <span>詳細分析を{msg.detailOpen ? "閉じる" : "見る"}</span>
                              {msg.detailOpen ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                            </button>
                            <AnimatePresence>
                              {msg.detailOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="mt-1.5 rounded border border-terminal-cyan/20 bg-terminal-cyan/5 px-2 py-1.5 text-[9px] leading-relaxed text-white/80">
                                    {msg.logicJp}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                    <Loader2 className="h-3 w-3 animate-spin text-terminal-cyan" />
                    <span className="text-[10px] text-white/30">AI分析中...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-white/6 px-3 py-2" style={{ background: "rgba(5,14,28,0.6)" }}>
              {/* Sample news chips — analysis mode only */}
              {chatMode === "analysis" && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {[
                    { label: "FRB利上げ", text: "FRBが0.25%の利上げを決定。インフレ抑制を優先する姿勢を維持" },
                    { label: "日銀緩和維持", text: "日銀が現行の金融緩和政策を維持。マイナス金利の継続を決定" },
                    { label: "米雇用統計↑", text: "米国の雇用統計が予想を大幅に上回る。非農業部門雇用者数+30万人" },
                    { label: "円安介入示唆", text: "日本政府・財務省が過度な円安に対し市場介入を示唆する発言" },
                    { label: "米CPI鈍化", text: "米国CPI（消費者物価指数）が予想比低下。インフレ鈍化の兆しが見られる" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setChatInput(item.text)}
                      className="rounded px-2 py-0.5 text-[9px] transition-colors hover:bg-terminal-cyan/20"
                      style={{ border: "1px solid rgba(0,210,230,0.2)", background: "rgba(0,210,230,0.06)", color: "rgba(0,210,230,0.7)" }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend() }}
                  placeholder={chatMode === "analysis" ? "ニュース・経済指標を入力 (Ctrl+Enter)" : "FXについて質問 (Ctrl+Enter)"}
                  rows={2}
                  className="flex-1 resize-none rounded-lg px-2.5 py-1.5 text-[10px] outline-none transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.8)" }}
                />
                <button
                  onClick={handleSend}
                  disabled={isAiLoading || !chatInput.trim()}
                  className="flex flex-col items-center justify-center gap-1 rounded border border-terminal-cyan/40 bg-terminal-cyan/10 px-3 text-terminal-cyan transition-colors hover:bg-terminal-cyan/20 disabled:opacity-40"
                >
                  {isAiLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Send className="h-3.5 w-3.5" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Open positions */}
          <div className="flex shrink-0 max-h-52 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center gap-2 border-b border-white/6 px-5 py-2" style={{ background: "rgba(5,14,28,0.5)" }}>
              <Activity className="h-3.5 w-3.5 text-terminal-cyan" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/30">OPEN POSITIONS</span>
              {positionsWithLivePnl.length > 0 && (
                <span className="ml-auto rounded bg-terminal-cyan/10 px-1.5 py-0.5 text-[9px] text-terminal-cyan">
                  {positionsWithLivePnl.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {positionsWithLivePnl.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <DollarSign className="h-8 w-8 text-white/30/20" />
                  <span className="text-[11px] text-white/25">ポジションなし</span>
                  <span className="text-[10px] text-white/20">BUY / SELL でエントリー</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {positionsWithLivePnl.map((pos) => (
                    <motion.div
                      key={pos.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-xl p-3" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)" }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${pos.action === "BUY" ? "bg-terminal-green/15 text-terminal-green" : "bg-terminal-red/15 text-terminal-red"}`}>
                              {pos.action}
                            </span>
                            <span className="text-[10px] text-white/80">${pos.quantity}</span>
                            <span className="text-[9px] text-white/30">#{pos.id}</span>
                          </div>
                          <div className="text-[10px] text-white/30">
                            Entry: <span className="text-white/80">{pos.entry_price.toFixed(3)}</span>
                          </div>
                          <div className="text-[10px] text-white/30">
                            現在: <motion.span key={pos.current_price.toFixed(3)} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                              className={`font-bold ${pos.pnl >= 0 ? "text-terminal-green" : "text-terminal-red"}`}
                            >{pos.current_price.toFixed(3)}</motion.span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <motion.span
                            key={pos.pnl.toFixed(2)}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className={`text-[13px] font-bold tabular-nums ${pos.pnl >= 0 ? "text-terminal-green" : "text-terminal-red"}`}
                          >
                            {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                          </motion.span>
                          <button
                            onClick={() => handleClose(pos.id, pos)}
                            disabled={isLoadingTrade}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] transition-colors disabled:opacity-40" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
                          >
                            <X className="h-2.5 w-2.5" />CLOSE
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 text-[9px] text-white/20">
                        {pos.entry_time.slice(0, 16).replace("T", " ")}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center gap-3 border-t border-white/6 px-5 py-1.5" style={{ background: "rgba(5,14,28,0.8)" }}>
        <span className="text-[9px] tracking-wider text-white/20">
          ⚠ これはデモトレードです。価格はyfinance実データ＋シミュレーション。
        </span>
        <span className="ml-auto text-[9px] text-white/20">USD/JPY 5M · auto-refresh 60s</span>
      </div>
    </div>
  )
}
