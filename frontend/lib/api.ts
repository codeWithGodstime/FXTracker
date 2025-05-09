import type { Transaction } from "./types"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_URL}/transactions/`, {
      headers: {
        "Content-Type": "application/json"
      }
    })

    const responseData = await res.json()
    
    return responseData
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
