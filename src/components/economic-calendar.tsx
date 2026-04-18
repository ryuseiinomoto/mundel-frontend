"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Calendar, Zap, Loader2 } from "lucide-react"

interface CalendarEvent {
  time: string
  country: string
  countryFlag: string
  event: string
  actual: string
  forecast: string
  previous: string
  importance: 1 | 2 | 3
}

function getApiBase(): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  if (API_URL && API_URL.trim()) return API_URL.replace(/\/$/, "")
  if (typeof window === "undefined") return "http://localhost:8080"
  const hostname = window.location.hostname
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:8080"
  return "https://mundel-backend-490996932437.europe-west1.run.app"
}

function toImportance(v: unknown): 1 | 2 | 3 {
  const n = Number(v)
  if (n >= 3) return 3
  if (n === 2) return 2
  return 1
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "---"
  // "2026-04-17T08:30:00" → "08:30"
  const m = dateStr.match(/T(\d{2}:\d{2})/)
  if (m) return m[1]
  // "08:30" そのままの場合
  if (/^\d{2}:\d{2}/.test(dateStr)) return dateStr.slice(0, 5)
  return dateStr.slice(0, 5)
}

function normalizeCountry(raw: string): string {
  const upper = (raw ?? "").toUpperCase()
  if (upper === "UNITED STATES" || upper === "US") return "USD"
  if (upper === "JAPAN" || upper === "JP") return "JPY"
  return upper
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(raw: any): CalendarEvent {
  const country = normalizeCountry(raw.Country ?? raw.country ?? "")
  const actual = String(raw.Actual ?? raw.actual ?? "---").trim() || "---"
  const forecast = String(raw.Forecast ?? raw.forecast ?? "---").trim() || "---"
  const previous = String(raw.Previous ?? raw.previous ?? "---").trim() || "---"
  return {
    time: formatTime(raw.Date ?? raw.date ?? ""),
    country,
    countryFlag: country === "USD" ? "US" : country === "JPY" ? "JP" : "",
    event: String(raw.Event ?? raw.event ?? raw.Category ?? raw.category ?? "").trim(),
    actual,
    forecast,
    previous,
    importance: toImportance(raw.Importance ?? raw.importance ?? 1),
  }
}

function buildNewsText(ev: CalendarEvent): string {
  const country = ev.country === "USD" ? "米国" : ev.country === "JPY" ? "日本" : ev.country
  const hasActual = ev.actual !== "---"

  if (hasActual) {
    const actNum = parseFloat(ev.actual.replace(/[^0-9.-]/g, ""))
    const foreNum = parseFloat(ev.forecast.replace(/[^0-9.-]/g, ""))
    const beat = !isNaN(actNum) && !isNaN(foreNum) && actNum > foreNum
    const direction = isNaN(actNum) || isNaN(foreNum) ? "となり" : beat ? "上回り" : "下回り"
    return `${country}の${ev.event}が発表されました。実績値は${ev.actual}で、予想の${ev.forecast}を${direction}ました（前回: ${ev.previous}）。この結果がUSD/JPYに与える影響を分析してください。`
  }
  return `本日${ev.time}に${country}の${ev.event}が発表予定です。予想値は${ev.forecast}、前回値は${ev.previous}です。この指標がUSD/JPYに与える影響を分析してください。`
}

const MOCK_EVENTS: CalendarEvent[] = [
  { time: "08:30", country: "USD", countryFlag: "US", event: "Non-Farm Payrolls", actual: "256K", forecast: "160K", previous: "212K", importance: 3 },
  { time: "08:30", country: "USD", countryFlag: "US", event: "Unemployment Rate", actual: "4.1%", forecast: "4.2%", previous: "4.2%", importance: 3 },
  { time: "08:30", country: "USD", countryFlag: "US", event: "CPI (YoY)", actual: "3.0%", forecast: "2.9%", previous: "2.7%", importance: 3 },
  { time: "10:00", country: "USD", countryFlag: "US", event: "ISM Manufacturing PMI", actual: "49.3", forecast: "49.5", previous: "49.2", importance: 2 },
  { time: "19:00", country: "JPY", countryFlag: "JP", event: "BOJ Interest Rate Decision", actual: "0.50%", forecast: "0.50%", previous: "0.25%", importance: 3 },
  { time: "19:30", country: "JPY", countryFlag: "JP", event: "Tokyo CPI (YoY)", actual: "2.4%", forecast: "2.5%", previous: "2.6%", importance: 2 },
  { time: "21:00", country: "USD", countryFlag: "US", event: "FOMC Minutes", actual: "---", forecast: "---", previous: "---", importance: 2 },
  { time: "21:30", country: "USD", countryFlag: "US", event: "Initial Jobless Claims", actual: "219K", forecast: "225K", previous: "223K", importance: 1 },
  { time: "23:00", country: "JPY", countryFlag: "JP", event: "Tertiary Industry Index", actual: "0.3%", forecast: "0.1%", previous: "-0.1%", importance: 1 },
]

function ImportanceDot({ level }: { level: 1 | 2 | 3 }) {
  if (level === 3) {
    return (
      <div className="flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terminal-red opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-terminal-red" />
        </span>
        <span className="text-[9px] font-bold text-terminal-red">HIGH</span>
      </div>
    )
  }
  if (level === 2) {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-2 w-2 rounded-full bg-terminal-amber" />
        <span className="text-[9px] font-bold text-terminal-amber">MED</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/40" />
      <span className="text-[9px] text-muted-foreground">LOW</span>
    </div>
  )
}

function ActualCell({ actual, forecast }: { actual: string; forecast: string }) {
  if (actual === "---") {
    return <span className="text-muted-foreground/40">{actual}</span>
  }

  const actNum = parseFloat(actual.replace(/[%K]/g, ""))
  const foreNum = parseFloat(forecast.replace(/[%K]/g, ""))

  if (isNaN(actNum) || isNaN(foreNum)) {
    return <span className="text-foreground/80">{actual}</span>
  }

  if (actNum > foreNum) {
    return <span className="font-bold text-terminal-green">{actual}</span>
  }
  if (actNum < foreNum) {
    return <span className="font-bold text-terminal-red">{actual}</span>
  }
  return <span className="text-foreground/80">{actual}</span>
}

export function EconomicCalendar({ onAnalyze }: { onAnalyze?: (text: string) => void }) {
  const { t } = useTranslation()
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState<number | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    const apiBase = getApiBase()
    fetch(`${apiBase}/api/calendar`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[] = data.economic_calendar ?? []
        if (raw.length > 0) {
          setEvents(raw.map(mapEvent))
          setIsMock(false)
        } else {
          setIsMock(true)
        }
      })
      .catch(() => {
        setIsMock(true)
      })
      .finally(() => setLoading(false))
  }, [])

  function handleAnalyzeClick(ev: CalendarEvent, i: number) {
    if (!onAnalyze) return
    setAnalyzing(i)
    onAnalyze(buildNewsText(ev))
    setTimeout(() => setAnalyzing(null), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-terminal-amber" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-foreground">
            {t('ECONOMIC_CALENDAR_TITLE')}
          </span>
          <span className="text-[9px] tracking-wider text-terminal-amber">{t('ECONOMIC_CALENDAR_SUBTITLE')}</span>
          {isMock && !loading && (
            <span className="text-[9px] text-muted-foreground/40">(SAMPLE)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />}
          <span className="text-[9px] text-muted-foreground/50">UTC+9</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border text-[9px] tracking-wider text-muted-foreground">
              <th className="px-3 py-2 text-left font-bold">TIME</th>
              <th className="px-2 py-2 text-left font-bold">COUNTRY</th>
              <th className="px-2 py-2 text-left font-bold">EVENT</th>
              <th className="px-2 py-2 text-right font-bold">ACTUAL</th>
              <th className="px-2 py-2 text-right font-bold">FORECAST</th>
              <th className="px-2 py-2 text-right font-bold">PREVIOUS</th>
              <th className="px-3 py-2 text-right font-bold">IMPACT</th>
              {onAnalyze && <th className="px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {events.map((ev, i) => (
              <tr
                key={`${ev.event}-${i}`}
                className={`border-b border-border/40 text-[11px] transition-colors hover:bg-secondary/30 ${
                  ev.importance === 3 ? "bg-terminal-red/[0.03]" : ""
                }`}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-3 py-2 tabular-nums text-muted-foreground">
                  {ev.time}
                </td>
                <td className="px-2 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    ev.country === "JPY"
                      ? "bg-terminal-red/10 text-terminal-red"
                      : "bg-terminal-cyan/10 text-terminal-cyan"
                  }`}>
                    {ev.country}
                  </span>
                </td>
                <td className="max-w-[180px] truncate px-2 py-2 text-foreground/80">
                  {ev.event}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  <ActualCell actual={ev.actual} forecast={ev.forecast} />
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground/60">
                  {ev.forecast}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground/60">
                  {ev.previous}
                </td>
                <td className="px-3 py-2 text-right">
                  <ImportanceDot level={ev.importance} />
                </td>
                {onAnalyze && (
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => handleAnalyzeClick(ev, i)}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-[9px] font-bold tracking-wide transition-all ${
                        analyzing === i
                          ? "border border-terminal-green/40 bg-terminal-green/10 text-terminal-green"
                          : hoveredRow === i
                          ? "border border-white/15 bg-white/5 text-white/60 hover:border-terminal-green/30 hover:text-terminal-green/80"
                          : "invisible"
                      }`}
                    >
                      <Zap className="h-2.5 w-2.5" />
                      {analyzing === i ? "分析中..." : "分析"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
