import type { Transaction } from "./types"
import { dummyTransactions, generateDummyTransaction } from "./dummy-data"

const API_URL = "http://localhost:8000"

// In-memory storage for transactions
let transactions: Transaction[] = [...dummyTransactions]

// Simulate API call to fetch transactions
export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...transactions]
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function addTransaction(data: any): Promise<Transaction> {
  try {

    if (!data) {
      throw new Error("Invalid transaction data")
    }

    const res = await fetch(`${API_URL}/transactions/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const responseData = await res.json()

    return responseData
  } catch (error) {
    console.error("Error adding transaction:", error)
    throw new Error("Failed to add transaction")
  }
}
