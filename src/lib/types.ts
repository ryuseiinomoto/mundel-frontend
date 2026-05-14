export interface ShiftState {
  is: number
  lm: number
  bp: number
}

export interface AnalysisResult {
  analysis?: {
    is_shift?: number
    lm_shift?: number
    bp_shift?: number
    logic_jp?: string
    policy_effectiveness?: string
    error?: string
  }
  market_data?: {
    exchange?: {
      current_price?: number
      pair?: string
      closes_7d?: Array<{ date: string; close: number }>
    }
    indicators?: {
      us_policy_rate?: number
      us_cpi?: number
      jp_policy_rate?: number
      jp_cpi?: number
    }
    errors?: string[]
  }
  shifts_delta?: {
    is?: number
    lm?: number
    bp?: number
  }
  timestamp?: string
  is_shift?: number
  lm_shift?: number
  bp_shift?: number
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
  signal?: "BUY" | "SELL" | "HOLD"
  signal_reason?: string
}
