"use client"

import { Calendar } from "lucide-react"

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

const MOCK_EVENTS: CalendarEvent[] = [
  {
    time: "08:30",
    country: "USD",
    countryFlag: "US",
    event: "Non-Farm Payrolls",
    actual: "256K",
    forecast: "160K",
    previous: "212K",
    importance: 3,
  },
  {
    time: "08:30",
    country: "USD",
    countryFlag: "US",
    event: "Unemployment Rate",
    actual: "4.1%",
    forecast: "4.2%",
    previous: "4.2%",
    importance: 3,
  },
  {
    time: "08:30",
    country: "USD",
    countryFlag: "US",
    event: "CPI (YoY)",
    actual: "3.0%",
    forecast: "2.9%",
    previous: "2.7%",
    importance: 3,
  },
  {
    time: "10:00",
    country: "USD",
    countryFlag: "US",
    event: "ISM Manufacturing PMI",
    actual: "49.3",
    forecast: "49.5",
    previous: "49.2",
    importance: 2,
  },
  {
    time: "19:00",
    country: "JPY",
    countryFlag: "JP",
    event: "BOJ Interest Rate Decision",
    actual: "0.50%",
    forecast: "0.50%",
    previous: "0.25%",
    importance: 3,
  },
  {
    time: "19:30",
    country: "JPY",
    countryFlag: "JP",
    event: "Tokyo CPI (YoY)",
    actual: "2.4%",
    forecast: "2.5%",
    previous: "2.6%",
    importance: 2,
  },
  {
    time: "21:00",
    country: "USD",
    countryFlag: "US",
    event: "FOMC Minutes",
    actual: "---",
    forecast: "---",
    previous: "---",
    importance: 2,
  },
  {
    time: "21:30",
    country: "USD",
    countryFlag: "US",
    event: "Initial Jobless Claims",
    actual: "219K",
    forecast: "225K",
    previous: "223K",
    importance: 1,
  },
  {
    time: "23:00",
    country: "JPY",
    countryFlag: "JP",
    event: "Tertiary Industry Index",
    actual: "0.3%",
    forecast: "0.1%",
    previous: "-0.1%",
    importance: 1,
  },
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

export function EconomicCalendar() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-terminal-amber" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-foreground">
            ECONOMIC CALENDAR
          </span>
          <span className="text-[9px] tracking-wider text-terminal-amber">(Trading Economics)</span>
        </div>
        <span className="text-[9px] text-muted-foreground/50">UTC+9</span>
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
            </tr>
          </thead>
          <tbody>
            {MOCK_EVENTS.map((ev, i) => (
              <tr
                key={`${ev.event}-${i}`}
                className={`border-b border-border/40 text-[11px] transition-colors hover:bg-secondary/30 ${
                  ev.importance === 3 ? "bg-terminal-red/[0.03]" : ""
                }`}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
