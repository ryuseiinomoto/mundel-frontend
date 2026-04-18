"use client"

import { useState, useEffect } from "react"
import { Newspaper, Zap, Loader2, RefreshCw } from "lucide-react"
import { getApiBase } from "@/lib/api"

interface NewsArticle {
  title: string
  description: string | null
  source: string
  publishedAt: string
  url: string
}

function formatTime(iso: string): string {
  if (!iso) return "---"
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    })
  } catch {
    return "---"
  }
}

function buildAnalysisText(article: NewsArticle): string {
  const desc = article.description ? ` ${article.description}` : ""
  return `${article.title}.${desc} この内容がUSD/JPYに与える影響を分析してください。`
}

export function NewsFeed({ onAnalyze }: { onAnalyze?: (text: string) => void }) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<number | null>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  function fetchNews() {
    setLoading(true)
    const apiBase = getApiBase()
    fetch(`${apiBase}/api/calendar`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[] = data.news ?? []
        setArticles(
          raw.map((a) => ({
            title: a.title ?? "",
            description: a.description ?? null,
            source: a.source?.name ?? a.source ?? "",
            publishedAt: a.publishedAt ?? "",
            url: a.url ?? "",
          }))
        )
      })
      .catch(() => {
        setArticles([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNews()
  }, [])

  function handleAnalyze(article: NewsArticle, i: number) {
    if (!onAnalyze) return
    setAnalyzing(i)
    onAnalyze(buildAnalysisText(article))
    setTimeout(() => setAnalyzing(null), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5 text-terminal-amber" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-foreground">
            FX NEWS
          </span>
          <span className="text-[9px] tracking-wider text-terminal-amber">MARKET FEED</span>
        </div>
        <div className="flex items-center gap-2">
          {loading
            ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
            : (
              <button
                onClick={fetchNews}
                className="text-muted-foreground/30 transition-colors hover:text-muted-foreground/70"
                title="更新"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )
          }
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] text-muted-foreground/40">ニュースを取得中...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] text-muted-foreground/40">ニュースが取得できませんでした</span>
          </div>
        ) : (
          articles.map((article, i) => (
            <div
              key={`${article.publishedAt}-${i}`}
              className="group flex items-start gap-3 border-b border-border/30 px-4 py-3 transition-colors hover:bg-secondary/20"
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* 時刻 */}
              <span className="shrink-0 pt-0.5 text-[10px] tabular-nums text-muted-foreground/50">
                {formatTime(article.publishedAt)}
              </span>

              {/* 本文 */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[11px] leading-relaxed text-foreground/80 group-hover:text-foreground">
                  {article.title}
                </p>
                {article.description && (
                  <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground/50">
                    {article.description}
                  </p>
                )}
                <span className="text-[9px] text-muted-foreground/40">{article.source}</span>
              </div>

              {/* 分析ボタン */}
              {onAnalyze && (
                <button
                  onClick={() => handleAnalyze(article, i)}
                  className={`mt-0.5 flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[9px] font-bold tracking-wide transition-all ${
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
