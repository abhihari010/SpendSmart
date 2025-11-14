"use client"

// AI-GENERATED (Cursor AI Assistant), 2025-01-XX
// Prompt: "Update the transaction provider to use the backend API instead of localStorage.
// It should fetch transactions on mount, create transactions via API, handle loading/error
// states, and convert between frontend format (with name field) and backend format."
//
// Modifications by Abhishek:
// - Added API integration for fetching and creating transactions
// - Added schema conversion between frontend (with name) and backend (with source) formats
// - Added error handling and loading states
// - Maintained fallback to localStorage if API fails
// - Made addTransaction async to work with API calls

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { fetchTransactions, createTransaction as createTransactionApi, type ApiTransaction } from "@/lib/api"

// Frontend transaction interface (includes name for display)
interface Transaction {
  id: string
  name: string
  date: string // ISO date string (YYYY-MM-DD)
  category: string
  amount: number
  source?: "manual" | "receipt" | "card"
}

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id" | "source">) => Promise<void>
  isLoading: boolean
  error: string | null
  refreshTransactions: () => Promise<void>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert API transaction to frontend transaction format
  const apiToFrontend = (apiTx: ApiTransaction): Transaction => {
    return {
      id: apiTx.id,
      name: apiTx.category, // Use category as name for now (backend doesn't have name field)
      date: apiTx.date,
      category: apiTx.category,
      amount: apiTx.amount,
      source: apiTx.source || "manual",
    }
  }

  // Load transactions from backend API
  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const apiTransactions = await fetchTransactions()
      const frontendTransactions = apiTransactions.map(apiToFrontend)
      setTransactions(frontendTransactions)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
      setError(errorMessage)
      console.error("Error loading transactions:", err)
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem("spendsmart-transactions")
      if (stored) {
        try {
          setTransactions(JSON.parse(stored))
        } catch {
          // Ignore localStorage parse errors
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const addTransaction = async (transaction: Omit<Transaction, "id" | "source">) => {
    try {
      setError(null)
      // Convert frontend transaction to API format
      const apiTransaction: Omit<ApiTransaction, "id"> = {
        date: transaction.date,
        amount: transaction.amount,
        category: transaction.category,
        source: "manual", // Default to manual for user-created transactions
      }

      const created = await createTransactionApi(apiTransaction)
      
      // Convert back to frontend format and add to state
      const frontendTransaction = apiToFrontend(created)
      // Update name from the original transaction (since backend doesn't store it)
      frontendTransaction.name = transaction.name || transaction.category
      
      setTransactions((prev) => [frontendTransaction, ...prev])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create transaction"
      setError(errorMessage)
      console.error("Error creating transaction:", err)
      throw err
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        isLoading,
        error,
        refreshTransactions: loadTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
