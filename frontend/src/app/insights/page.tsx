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

  // Component variables to work around React 19 type compatibility
  const AlertCircleIcon = AlertCircle as React.ComponentType<{ className?: string }>
  const CheckCircle2Icon = CheckCircle2 as React.ComponentType<{ className?: string }>

  const monthlySpending = useMemo(() => {
    const months: { [key: string]: number } = {}
    transactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const date = new Date(t.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        months[monthKey] = (months[monthKey] || 0) + Math.abs(t.amount)
      })
    return months
  }, [transactions])

  const last8Months = useMemo(() => {
    const months = []
    const currentDate = new Date(2025, 10) // November 2025
    for (let i = 7; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleString("default", { month: "short" })
      const amount = monthlySpending[monthKey] || 0
      months.push({ month: monthName, amount })
    }
    return months
  }, [monthlySpending])

  const categorySpending = useMemo(() => {
    const categories: { [key: string]: number } = {}
    transactions
      .filter((t) => {
        const date = new Date(t.date)
        return t.amount < 0 && date.getMonth() === 10 && date.getFullYear() === 2025
      })
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount)
      })
    return categories
  }, [transactions])

  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => {
          const date = new Date(t.date)
          return t.amount < 0 && date.getMonth() === 10 && date.getFullYear() === 2025
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
  )

  const budgetData = [
    { name: "Food", budget: 600, spent: categorySpending["Food"] || 0 },
    { name: "Bills", budget: 400, spent: categorySpending["Bills"] || 0 },
    { name: "Shopping", budget: 300, spent: categorySpending["Shopping"] || 0 },
    { name: "Transport", budget: 250, spent: categorySpending["Transport"] || 0 },
    { name: "Entertainment", budget: 150, spent: categorySpending["Entertainment"] || 0 },
  ]

  const totalBudget = budgetData.reduce((sum, cat) => sum + cat.budget, 0)
  const budgetStatus = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const budgetRemaining = totalBudget - totalSpent
  const categoriesOverBudget = budgetData.filter((cat) => cat.spent > cat.budget).length

  const weeklySpending = useMemo(() => {
    const weeks = [0, 0, 0, 0]
    transactions
      .filter((t) => {
        const date = new Date(t.date)
        return t.amount < 0 && date.getMonth() === 10 && date.getFullYear() === 2025
      })
      .forEach((t) => {
        const date = new Date(t.date)
        const dayOfMonth = date.getDate()
        const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3)
        weeks[weekIndex] += Math.abs(t.amount)
      })
    return weeks
  }, [transactions])

  const maxMonthlySpending = Math.max(...last8Months.map((m) => m.amount), 100)
  const maxWeeklySpending = Math.max(...weeklySpending, 100)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main
        className={cn(
          "flex-1 overflow-auto bg-background transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64",
        )}
      >
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-semibold text-foreground">Spending Insights</h1>
            <p className="text-sm text-muted-foreground">Understand your spending patterns and trends</p>
          </div>

          {/* Alert Banners */}
          <div className="mb-8 space-y-4">
            {budgetStatus <= 100 && (
              <div className="flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                <CheckCircle2Icon className="h-5 w-5 shrink-0 text-green-400" />
                <div className="flex-1">
                  <div className="font-medium text-green-400">Great job!</div>
                  <div className="text-sm text-green-400/80">
                    {"You're staying within budget this month. Keep it up!"}
                  </div>
                </div>
              </div>
            )}
            {budgetStatus > 100 && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <AlertCircleIcon className="h-5 w-5 shrink-0 text-red-400" />
                <div className="flex-1">
                  <div className="font-medium text-red-400">Watch out!</div>
                  <div className="text-sm text-red-400/80">
                    {`Your spending is ${budgetStatus}% of budget. Consider reviewing your expenses.`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">${totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">This month (November)</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-3xl font-bold", budgetStatus > 100 ? "text-destructive" : "text-primary")}>
                  {budgetStatus}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {budgetRemaining >= 0
                    ? `$${budgetRemaining.toFixed(2)} remaining`
                    : `$${Math.abs(budgetRemaining).toFixed(2)} over budget`}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Categories Over Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">{categoriesOverBudget}</div>
                <p className="text-xs text-muted-foreground">of 5 categories</p>
              </CardContent>
            </Card>
          </div>

          {/* Category-wise Spending Chart */}
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Category-wise Spending</CardTitle>
              <CardDescription>Compare actual spending vs budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetData.map((category, i) => (
                  <div key={i}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{category.name}</span>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">Budget: ${category.budget}</span>
                        <span className="text-card-foreground">Spent: ${category.spent.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative h-8 flex-1 overflow-hidden rounded bg-muted">
                        <div className="absolute inset-y-0 left-0 rounded bg-primary/30" style={{ width: "100%" }} />
                      </div>
                      <div className="relative h-8 flex-1 overflow-hidden rounded bg-muted">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded",
                            category.spent > category.budget ? "bg-destructive" : "bg-primary",
                          )}
                          style={{ width: `${Math.min((category.spent / category.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded bg-muted" />
                  <span className="text-muted-foreground">Budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded bg-primary" />
                  <span className="text-muted-foreground">Spent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Trend */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Monthly Trend</CardTitle>
                <CardDescription>Last 8 months spending pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64">
                  <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-muted-foreground">
                    <span>${Math.round(maxMonthlySpending)}</span>
                    <span>${Math.round(maxMonthlySpending * 0.75)}</span>
                    <span>${Math.round(maxMonthlySpending * 0.5)}</span>
                    <span>${Math.round(maxMonthlySpending * 0.25)}</span>
                    <span>$0</span>
                  </div>
                  <div className="ml-12">
                    <svg className="h-full w-full" viewBox="0 0 600 250">
                      <defs>
                        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line
                        x1="0"
                        y1="50"
                        x2="600"
                        y2="50"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-border"
                      />
                      <line
                        x1="0"
                        y1="100"
                        x2="600"
                        y2="100"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-border"
                      />
                      <line
                        x1="0"
                        y1="150"
                        x2="600"
                        y2="150"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-border"
                      />
                      <line
                        x1="0"
                        y1="200"
                        x2="600"
                        y2="200"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-border"
                      />
                      <path
                        d={`M 0 ${250 - (last8Months[0].amount / maxMonthlySpending) * 200} ${last8Months
                          .map((m, i) => {
                            const x = (i / 7) * 600
                            const y = 250 - (m.amount / maxMonthlySpending) * 200
                            return `L ${x} ${y}`
                          })
                          .join(" ")} L 600 250 L 0 250 Z`}
                        fill="url(#trendGradient)"
                      />
                      {/* Line */}
                      <path
                        d={`M 0 ${250 - (last8Months[0].amount / maxMonthlySpending) * 200} ${last8Months
                          .map((m, i) => {
                            const x = (i / 7) * 600
                            const y = 250 - (m.amount / maxMonthlySpending) * 200
                            return `L ${x} ${y}`
                          })
                          .join(" ")}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      {/* Data points */}
                      {last8Months.map((m, i) => (
                        <circle
                          key={i}
                          cx={(i / 7) * 600}
                          cy={250 - (m.amount / maxMonthlySpending) * 200}
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

            {/* Weekly Breakdown */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Weekly Breakdown</CardTitle>
                <CardDescription>November 2025 weekly spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-64 flex-col justify-between text-xs text-muted-foreground">
                    <span>${Math.round(maxWeeklySpending)}</span>
                    <span>${Math.round(maxWeeklySpending * 0.75)}</span>
                    <span>${Math.round(maxWeeklySpending * 0.5)}</span>
                    <span>${Math.round(maxWeeklySpending * 0.25)}</span>
                    <span>$0</span>
                  </div>
                  <div className="ml-12 flex h-64 items-end justify-around gap-4">
                    {weeklySpending.map((amount, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex w-full items-end justify-center">
                          <div
                            className="w-full rounded-t bg-primary"
                            style={{ height: `${(amount / maxWeeklySpending) * 200}px` }}
                            title={`$${amount.toFixed(2)}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">Week {i + 1}</span>
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
