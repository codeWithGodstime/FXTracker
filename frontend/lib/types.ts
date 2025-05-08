export interface MatchedBuy {
  buy_id: string
  amount_used: number
  naira_rate_used_in_transation: number
}

export interface Transaction {
  id: string
  type: "BUY" | "SELL"
  date: string
  amount: number
  naira_rate_used_in_transation: number
  total: number
  gain_percent: number
  used_buy_info?: MatchedBuy[]
}

export interface Metrics {
  totalBought: number
  totalSold: number
  netGain: number
  currentBalance: number
  profitOverTime: {
    date: string
    profit: number
  }[]
}
