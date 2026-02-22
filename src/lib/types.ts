export interface ShiftState {
  is: number
  lm: number
  bp: number
}

export interface AnalysisResult {
  analysis?: {
    is_shift?: string
    lm_shift?: string
    bp_shift?: string
    logic_jp?: string
    error?: string
  }
  market_data?: {
    exchange?: { current_price?: number; pair?: string; closes_7d?: unknown[] }
    indicators?: {
      us_policy_rate?: number
      us_cpi?: number
      jp_policy_rate?: number
      jp_cpi?: number
    }
    errors?: string[]
  }
  timestamp?: string
  is_shift?: string
  lm_shift?: string
  bp_shift?: string
  logic_jp?: string
  explanation?: string
  policy_effectiveness?: string
  regime?: string
  fx_rate?: number
  us_interest_rate?: number
  cpi?: number
  exchange_rate_effect?: string
  interest_rate_effect?: string
  output_effect?: string
  capital_flow?: string
  summary?: string
  [key: string]: unknown
}

export function directionToNumber(dir: string | undefined): number {
  if (!dir || dir === "none") return 0
  if (dir === "right" || dir === "upward") return 1
  if (dir === "left" || dir === "downward") return -1
  return 0
}
