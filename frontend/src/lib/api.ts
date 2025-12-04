// API configuration and utility functions for SpendSmart frontend
// 
// AI-GENERATED (Cursor AI Assistant), 2025-01-XX
// Prompt: "Create an API utility module with functions for all backend endpoints including
// transactions (GET, POST), goals (GET, POST, PUT), and health check. Include TypeScript
// interfaces matching the backend schemas and proper error handling."
// 
// Modifications by Abhishek:
// - Added comprehensive error handling with try-catch and error message extraction
// - Added support for query parameters in fetchTransactions
// - Ensured type safety with matching interfaces

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface ApiTransaction {
  id: string
  date: string
  amount: number
  category: string
  source?: "manual" | "receipt" | "card"
}

export interface ApiGoal {
  id: string
  category: string
  targetAmount: number
  startDate: string
  endDate: string
  period?: "weekly" | "monthly" | "custom"
  createdAt?: string
  updatedAt?: string
}

// Transaction API calls
export async function fetchTransactions(from?: string, to?: string): Promise<ApiTransaction[]> {
  const params = new URLSearchParams()
  if (from) params.append("from", from)
  if (to) params.append("to", to)
  
  const url = `${API_BASE_URL}/api/transactions${params.toString() ? `?${params.toString()}` : ""}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

export async function createTransaction(
  transaction: Omit<ApiTransaction, "id">
): Promise<ApiTransaction> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Failed to create transaction: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

// Goals API calls
export async function fetchGoals(): Promise<ApiGoal[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/goals`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

export async function createGoal(goal: Omit<ApiGoal, "id" | "createdAt" | "updatedAt">): Promise<ApiGoal> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Failed to create goal: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<ApiGoal, "id" | "createdAt" | "updatedAt">>
): Promise<ApiGoal> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Failed to update goal: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

// Receipt ingestion API
export interface ReceiptIngestResponse {
  suite: string
  raw: {
    date: string
    amount: number
    category: string
    merchant: string
    rawText: string
    note: string
  }
  normalized: ApiTransaction
}

export async function ingestReceipt(file: File): Promise<ReceiptIngestResponse> {
  const formData = new FormData()
  formData.append("file", file)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest?suite=receipt`, {
      method: "POST",
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Failed to scan receipt: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

// Health check
export async function checkHealth(): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`)
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 3001.`)
    }
    throw error
  }
}

