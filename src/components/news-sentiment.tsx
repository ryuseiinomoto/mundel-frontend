"use client"

import { useTranslation } from "react-i18next"
import { Newspaper, ExternalLink } from "lucide-react"

interface NewsItem {
  time: string
  headline: string
  source: string
  sentiment: "bullish" | "bearish" | "neutral"
  pair: string
}

const MOCK_NEWS: NewsItem[] = [
  {
    time: "14:32",
    headline: "Fed Chair Powell signals patience on rate cuts, cites persistent inflation",
    source: "Reuters",
    sentiment: "bullish",
    pair: "USD/JPY",
  },
  {
    time: "13:58",
    headline: "BOJ Governor Ueda hints at additional rate hikes in coming quarters",
    source: "Nikkei",
    sentiment: "bearish",
    pair: "USD/JPY",
  },
  {
    time: "12:45",
    headline: "US Treasury yields surge to 4.8% after strong jobs report",
    source: "Bloomberg",
    sentiment: "bullish",
    pair: "USD/JPY",
  },
  {
    time: "11:20",
    headline: "Japan core CPI accelerates to 2.4%, exceeding market expectations",
    source: "Reuters",
    sentiment: "bearish",
    pair: "USD/JPY",
  },
  {
    time: "10:05",
    headline: "IMF upgrades US growth forecast to 2.7% for 2026",
    source: "IMF",
    sentiment: "bullish",
    pair: "USD/JPY",
  },
  {
    time: "09:30",
    headline: "China PBOC injects record liquidity, weakening yuan further",
    source: "SCMP",
    sentiment: "neutral",
    pair: "USD/CNY",
  },
  {
    time: "08:15",
    headline: "Japan current account surplus narrows on rising import costs",
    source: "MOF",
    sentiment: "bearish",
    pair: "USD/JPY",
  },
  {
    time: "07:00",
    headline: "ECB Lagarde warns of stagflation risks in Euro area amid trade tensions",
    source: "ECB",
    sentiment: "neutral",
    pair: "EUR/USD",
  },
]

function SentimentBadge({ sentiment }: { sentiment: NewsItem["sentiment"] }) {
  const config = {
    bullish: { label: "BULL", className: "bg-terminal-green/15 text-terminal-green" },
    bearish: { label: "BEAR", className: "bg-terminal-red/15 text-terminal-red" },
    neutral: { label: "NEUT", className: "bg-muted-foreground/10 text-muted-foreground" },
  }
  const c = config[sentiment]
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider ${c.className}`}>
      {c.label}
    </span>
  )
}

export function NewsSentiment() {
  const { t } = useTranslation()
  
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5 text-terminal-green" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-foreground">
            {t('NEWS_SENTIMENT_TITLE')}
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50">LIVE FEED</span>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto">
        {MOCK_NEWS.map((news, i) => (
          <div
            key={`${news.time}-${i}`}
            className="group flex items-start gap-3 border-b border-border/30 px-4 py-3 transition-colors hover:bg-secondary/20"
          >
            <span className="shrink-0 pt-0.5 text-[10px] tabular-nums text-muted-foreground/50">
              {news.time}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-[11px] leading-relaxed text-foreground/80 group-hover:text-foreground">
                {news.headline}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground/50">{news.source}</span>
                <span className="text-[9px] text-muted-foreground/30">|</span>
                <span className="text-[9px] text-terminal-cyan/60">{news.pair}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <SentimentBadge sentiment={news.sentiment} />
              <ExternalLink className="h-3 w-3 text-muted-foreground/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
