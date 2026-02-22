"use client"

const DATA = [
  { pair: "USD/JPY", value: "154.32", change: "+0.45" },
  { pair: "EUR/USD", value: "1.0842", change: "-0.12" },
  { pair: "GBP/USD", value: "1.2654", change: "+0.08" },
  { pair: "USD/CHF", value: "0.8876", change: "-0.23" },
  { pair: "AUD/USD", value: "0.6543", change: "+0.15" },
  { pair: "USD/CAD", value: "1.3567", change: "-0.07" },
  { pair: "NZD/USD", value: "0.6087", change: "+0.11" },
  { pair: "EUR/JPY", value: "167.21", change: "+0.33" },
  { pair: "GBP/JPY", value: "195.14", change: "+0.52" },
  { pair: "CHF/JPY", value: "173.82", change: "-0.18" },
]

function TickerItem({ pair, value, change }: (typeof DATA)[number]) {
  const isUp = change.startsWith("+")
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <span className="text-[10px] text-muted-foreground">{pair}</span>
      <span className="text-[10px] font-bold text-foreground">{value}</span>
      <span className={`text-[10px] ${isUp ? "text-terminal-green" : "text-terminal-red"}`}>
        {change}
      </span>
    </span>
  )
}

export function StatusTicker() {
  const items = [...DATA, ...DATA]

  return (
    <div className="flex items-center gap-4 overflow-hidden border-t border-border bg-card px-4 py-1.5">
      <span className="shrink-0 text-[9px] font-bold tracking-[0.2em] text-muted-foreground">
        FX LIVE
      </span>
      <div className="h-3 w-px bg-border" />
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
          {items.map((d, i) => (
            <TickerItem key={`${d.pair}-${i}`} {...d} />
          ))}
        </div>
      </div>
    </div>
  )
}
