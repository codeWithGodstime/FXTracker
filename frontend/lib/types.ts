export interface MatchedBuy {
  id: string
  date: string
  amount: number
  rate: number
  profit: number
}

export interface Transaction {
  id: string
  type: "BUY" | "SELL"
  date: string
  amount: number
  rate: number
  total: number
  gain: number
  gainPercentage: number
  matchedBuys?: MatchedBuy[]
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
