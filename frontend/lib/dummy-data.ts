import type { Transaction, Metrics } from "./types"
import { format, subMonths } from "date-fns"

// Generate dummy transactions
export const dummyTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "BUY",
    date: "2023-12-15T10:30:00Z",
    amount: 1000,
    rate: 750,
    total: 750000,
    gain: 0,
    gainPercentage: 0,
    matchedBuys: [],
  },
  {
    id: "tx-2",
    type: "BUY",
    date: "2024-01-10T14:45:00Z",
    amount: 500,
    rate: 800,
    total: 400000,
    gain: 0,
    gainPercentage: 0,
    matchedBuys: [],
  },
  {
    id: "tx-3",
    type: "SELL",
    date: "2024-02-05T09:15:00Z",
    amount: 300,
    rate: 850,
    total: 255000,
    gain: 30000,
    gainPercentage: 13.33,
    matchedBuys: [
      {
        id: "tx-1",
        date: "2023-12-15T10:30:00Z",
        amount: 300,
        rate: 750,
        profit: 30000,
      },
    ],
  },
  {
    id: "tx-4",
    type: "BUY",
    date: "2024-02-20T16:20:00Z",
    amount: 800,
    rate: 820,
    total: 656000,
    gain: 0,
    gainPercentage: 0,
    matchedBuys: [],
  },
  {
    id: "tx-5",
    type: "SELL",
    date: "2024-03-15T11:10:00Z",
    amount: 500,
    rate: 900,
    total: 450000,
    gain: 75000,
    gainPercentage: 20,
    matchedBuys: [
      {
        id: "tx-1",
        date: "2023-12-15T10:30:00Z",
        amount: 500,
        rate: 750,
        profit: 75000,
      },
    ],
  },
]

// Generate dummy metrics
export const dummyMetrics: Metrics = {
  totalBought: 2300,
  totalSold: 800,
  netGain: 105000,
  currentBalance: 1500,
  profitOverTime: [
    { date: format(subMonths(new Date(), 5), "MMM yyyy"), profit: 0 },
    { date: format(subMonths(new Date(), 4), "MMM yyyy"), profit: 0 },
    { date: format(subMonths(new Date(), 3), "MMM yyyy"), profit: 30000 },
    { date: format(subMonths(new Date(), 2), "MMM yyyy"), profit: 30000 },
    { date: format(subMonths(new Date(), 1), "MMM yyyy"), profit: 105000 },
    { date: format(new Date(), "MMM yyyy"), profit: 105000 },
  ],
}

// Function to get dummy metrics with safety checks
export function getDummyMetrics(): Metrics {
  try {
    return { ...dummyMetrics }
  } catch (error) {
    console.error("Error getting dummy metrics:", error)
    // Return a safe default if there's an error
    return {
      totalBought: 0,
      totalSold: 0,
      netGain: 0,
      currentBalance: 0,
      profitOverTime: [],
    }
  }
}

// Function to generate a new transaction with dummy data
export function generateDummyTransaction(data: any): Transaction {
  try {
    const id = `tx-${Math.floor(Math.random() * 10000)}`
    const amount = Number(data?.amount) || 0
    const rate = Number(data?.rate) || 0
    const total = amount * rate
    const type = data?.type === "SELL" ? "SELL" : "BUY"
    const date = data?.date ? data.date.toISOString() : new Date().toISOString()

    if (type === "BUY") {
      return {
        id,
        type: "BUY",
        date,
        amount,
        rate,
        total,
        gain: 0,
        gainPercentage: 0,
        matchedBuys: [],
      }
    } else {
      // For SELL transactions, generate some dummy profit data
      const profit = amount * (rate - 750) // Assuming bought at 750
      return {
        id,
        type: "SELL",
        date,
        amount,
        rate,
        total,
        gain: profit,
        gainPercentage: amount > 0 ? (profit / (amount * 750)) * 100 : 0,
        matchedBuys: [
          {
            id: "dummy-buy",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            amount,
            rate: 750,
            profit,
          },
        ],
      }
    }
  } catch (error) {
    console.error("Error generating dummy transaction:", error)
    // Return a safe default transaction if there's an error
    return {
      id: `error-${Date.now()}`,
      type: "BUY",
      date: new Date().toISOString(),
      amount: 0,
      rate: 0,
      total: 0,
      gain: 0,
      gainPercentage: 0,
      matchedBuys: [],
    }
  }
}
