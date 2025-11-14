"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Transaction {
  id: string
  name: string
  date: string // Now stores ISO date string (YYYY-MM-DD) for proper parsing
  category: string
  amount: number
}

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("spendsmart-transactions")
    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("spendsmart-transactions", JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  return <TransactionContext.Provider value={{ transactions, addTransaction }}>{children}</TransactionContext.Provider>
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
