"use client"

import React, { useMemo } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { useSidebar } from "@/components/sidebar-provider"
import { useTransactions } from "@/components/transaction-provider"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function InsightsPage() {
  const { isCollapsed } = useSidebar()
  const { transactions } = useTransactions()

  // Normalize all transaction data from dashboard
  const normalizedTx = useMemo(() => {
    return transactions.map(t => ({
      ...t,
      // Normalize date → always "YYYY-MM-DD"
      date: new Date(t.date).toISOString().split("T")[0],
      // Normalize category (Food, Bills, etc)
      category: String(t.category || "").trim(),
      // Ensure expenses are negative, income are positive
      amount: typeof t.amount === "number" ? t.amount : Number(t.amount)
    }))
  }, [transactions])

  // -----------------------------------------------------
  // MONTHLY SPENDING
  // -----------------------------------------------------
  const monthlySpending = useMemo(() => {
    const map: Record<string, number> = {}

    normalizedTx
      .filter(t => t.amount < 0)
      .forEach(t => {
        const d = new Date(t.date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        map[key] = (map[key] || 0) + Math.abs(t.amount)
      })

    return map
  }, [normalizedTx])

  // Last 8 months
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthLabel = now.toLocaleString("default", { month: "long" })

  const last8Months = useMemo(() => {
    const arr = []
    for (let i = 7; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      arr.push({
        month: d.toLocaleString("default", { month: "short" }),
        amount: monthlySpending[key] || 0
      })
    }
    return arr
  }, [monthlySpending, currentMonth, currentYear])

  // -----------------------------------------------------
  // CATEGORY SPENDING
  // -----------------------------------------------------
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {}

    normalizedTx.forEach(t => {
      if (t.amount < 0) {
        const d = new Date(t.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          map[t.category] = (map[t.category] || 0) + Math.abs(t.amount)
        }
      }
    })

    return map
  }, [normalizedTx, currentMonth, currentYear])

  const totalSpent = useMemo(() => {
    return normalizedTx
      .filter(t => {
        const d = new Date(t.date)
        return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }, [normalizedTx, currentMonth, currentYear])

  // -----------------------------------------------------
  // STATIC BUDGETS (Option A)
  // -----------------------------------------------------
  const budgetData = [
    { name: "Food", budget: 600, spent: categorySpending["Food"] || 0 },
    { name: "Bills", budget: 400, spent: categorySpending["Bills"] || 0 },
    { name: "Shopping", budget: 300, spent: categorySpending["Shopping"] || 0 },
    { name: "Transport", budget: 250, spent: categorySpending["Transport"] || 0 },
    { name: "Entertainment", budget: 150, spent: categorySpending["Entertainment"] || 0 }
  ]

  const totalBudget = budgetData.reduce((sum, c) => sum + c.budget, 0)
  const budgetStatus = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0
  const budgetRemaining = totalBudget - totalSpent
  const categoriesOverBudget = budgetData.filter(c => c.spent > c.budget).length

  // Weekly breakdown
  const weeklySpending = useMemo(() => {
    const maxDays = new Date(currentYear, currentMonth + 1, 0).getDate()
    const weeks = Array(Math.ceil(maxDays / 7)).fill(0)

    normalizedTx.forEach(t => {
      if (t.amount < 0) {
        const d = new Date(t.date)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const index = Math.floor((d.getDate() - 1) / 7)
          weeks[index] += Math.abs(t.amount)
        }
      }
    })

    return weeks
  }, [normalizedTx, currentMonth, currentYear])

  // Peak values for charts
  const maxMonthly = Math.max(...last8Months.map(m => m.amount), 100)
  const maxWeekly = Math.max(...weeklySpending, 100)

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  const AlertCircleIcon = AlertCircle as any
  const CheckCircle2Icon = CheckCircle2 as any

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main
        className={cn(
          "flex-1 overflow-auto bg-background transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1">Spending Insights</h1>
            <p className="text-sm text-muted-foreground">
              Understand your spending patterns and trends
            </p>
          </div>

          {/* Alert */}
          <div className="mb-8">
            {budgetStatus <= 100 ? (
              <div className="flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                <CheckCircle2Icon className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-medium text-green-400">Great job!</div>
                  <div className="text-sm text-green-400/80">
                    You're staying within budget this month.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <AlertCircleIcon className="h-5 w-5 text-red-400" />
                <div>
                  <div className="font-medium text-red-400">Watch out!</div>
                  <div className="text-sm text-red-400/80">
                    You're over budget this month.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 mb-8 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  This month ({monthLabel})
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-3xl font-bold", budgetStatus > 100 ? "text-red-500" : "text-primary")}>
                  {budgetStatus}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {budgetRemaining >= 0
                    ? `$${budgetRemaining.toFixed(2)} remaining`
                    : `$${Math.abs(budgetRemaining).toFixed(2)} over`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Categories Over Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{categoriesOverBudget}</div>
                <p className="text-xs text-muted-foreground">of 5 categories</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Spending */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Category-wise Spending</CardTitle>
              <CardDescription>Compare spending vs budget</CardDescription>
            </CardHeader>
            <CardContent>
              {budgetData.map(cat => (
                <div key={cat.name} className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{cat.name}</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">Budget: ${cat.budget}</span>
                      <span>Spent: ${cat.spent.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-muted rounded relative">
                      <div className="absolute inset-0 bg-primary/30" />
                    </div>

                    <div className="h-8 flex-1 bg-muted rounded relative">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded",
                          cat.spent > cat.budget ? "bg-red-500" : "bg-primary"
                        )}
                        style={{
                          width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>Last 8 months spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64">
                  <div className="absolute left-0 top-0 flex flex-col justify-between h-full text-xs text-muted-foreground">
                    <span>${maxMonthly}</span>
                    <span>${Math.round(maxMonthly * 0.75)}</span>
                    <span>${Math.round(maxMonthly * 0.5)}</span>
                    <span>${Math.round(maxMonthly * 0.25)}</span>
                    <span>$0</span>
                  </div>

                  <div className="ml-12">
                    <svg viewBox="0 0 600 250" className="w-full h-full">
                      <defs>
                        <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Filled area */}
                      <path
                        d={
                          "M 0 " +
                          (250 - (last8Months[0].amount / maxMonthly) * 200) +
                          " " +
                          last8Months
                            .map((m, i) => {
                              const x = (i / 7) * 600
                              const y = 250 - (m.amount / maxMonthly) * 200
                              return `L ${x} ${y}`
                            })
                            .join(" ") +
                          " L 600 250 L 0 250 Z"
                        }
                        fill="url(#trend)"
                      />

                      {/* Line */}
                      <path
                        d={
                          "M 0 " +
                          (250 - (last8Months[0].amount / maxMonthly) * 200) +
                          " " +
                          last8Months
                            .map((m, i) => {
                              const x = (i / 7) * 600
                              const y = 250 - (m.amount / maxMonthly) * 200
                              return `L ${x} ${y}`
                            })
                            .join(" ")
                        }
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                      />

                      {/* Dots */}
                      {last8Months.map((m, i) => (
                        <circle
                          key={i}
                          cx={(i / 7) * 600}
                          cy={250 - (m.amount / maxMonthly) * 200}
                          r="4"
                          fill="#10b981"
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="ml-12 mt-2 flex justify-between text-xs text-muted-foreground">
                    {last8Months.map((m, i) => (
                      <span key={i}>{m.month}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Breakdown</CardTitle>
                <CardDescription>{monthLabel} spending</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="relative h-64">
                  <div className="absolute left-0 top-0 flex flex-col justify-between h-full text-xs text-muted-foreground">
                    <span>${maxWeekly}</span>
                    <span>${Math.round(maxWeekly * 0.75)}</span>
                    <span>${Math.round(maxWeekly * 0.5)}</span>
                    <span>${Math.round(maxWeekly * 0.25)}</span>
                    <span>$0</span>
                  </div>

                  <div className="ml-12 flex items-end justify-around h-full gap-4">
                    {weeklySpending.map((amt, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-10 bg-primary rounded-t"
                          style={{ height: `${(amt / maxWeekly) * 200}px` }}
                        />
                        <span className="text-xs text-muted-foreground">W{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
