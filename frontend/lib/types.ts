import { Interface } from "readline"

export interface MatchedBuy {
  buy_id: string
  amount_used: number
  date: Date,
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
  total_transaction_amount: number
  remaining_balance: number
  total_buy_transaction_amount: number
  total_sell_transaction_amount: number
  total_buy_count: number,
  total_sell_count: number,
  profitOverTime: {
    date: string
    profit: number
  }[]
}

interface MonthlyProfit {
  month: string;
  total_profit: number;
}

interface YearlyProfit {
  year: string;
  total_profit: number;
}

export interface OverviewInterface {
  monthly: MonthlyProfit
  yearly: YearlyProfit
}