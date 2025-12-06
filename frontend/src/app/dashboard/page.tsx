"use client"

import React, { useState, useMemo } from "react"

import { cn } from "@/lib/utils"
import { AppSidebar } from "@/components/app-sidebar"
import { useSidebar } from "@/components/sidebar-provider"
import { useTransactions } from "@/components/transaction-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, TrendingDown, Wallet, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { isCollapsed } = useSidebar()
  const { transactions, addTransaction } = useTransactions()
  const [open, setOpen] = useState(false)
  const { user } = useAuth();
  // Component variables to work around React 19 type compatibility
  const PlusIcon = Plus as React.ComponentType<{ className?: string }>
  const TrendingUpIcon = TrendingUp as React.ComponentType<{ className?: string }>
  const TrendingDownIcon = TrendingDown as React.ComponentType<{ className?: string }>
  const WalletIcon = Wallet as React.ComponentType<{ className?: string }>
  const SparklesIcon = Sparkles as React.ComponentType<{ className?: string }>

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )
  const totalExpenses = useMemo(
    () => Math.abs(transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    [transactions],
  )
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0

  const categorySpending = useMemo(() => {
    const categories: { [key: string]: number } = {}
    transactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount)
      })
    return categories
  }, [transactions])

  const totalCategorySpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)

  const monthlyData = useMemo(() => {
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
    const currentDate = new Date(2025, 10) // November 2025

    return months.map((monthName, index) => {
      const monthDate = new Date(2025, 5 + index) // Start from June (month 5)
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === monthDate.getMonth() && tDate.getFullYear() === monthDate.getFullYear()
      })

      const income = monthTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      const expense = Math.abs(monthTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))

      return { month: monthName, income, expense }
    })
  }, [transactions])

  const balanceTrendData = useMemo(() => {
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
    let cumulativeBalance = 0

    return months.map((monthName, index) => {
      const monthDate = new Date(2025, 5 + index)
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === monthDate.getMonth() && tDate.getFullYear() === monthDate.getFullYear()
      })

      const monthBalance = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
      cumulativeBalance += monthBalance

      return { month: monthName, balance: cumulativeBalance }
    })
  }, [transactions])

  const maxBalance = Math.max(...balanceTrendData.map((d) => d.balance), 100)
  const maxIncome = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense)), 100)

  // AI-GENERATED (Cursor AI Assistant), 2025-01-XX
  // Prompt: "Update handleAddTransaction to be async and work with the API. Also add a date
  // input field to the form so users can select a date when creating transactions."
  //
  // Modifications by Abhishek:
  // - Made function async to work with API calls
  // - Added date field reading from form data
  // - Fixed TypeScript error by storing e.currentTarget in form variable
  // - Added date input field to the form with max attribute to prevent future dates
  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const type = formData.get("type") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    try {
      await addTransaction({
        name: formData.get("name") as string,
        date: (formData.get("date") as string) || new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        category: formData.get("category") as string,
        amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to add transaction:", error)
      // You might want to show a toast/error message here
    }
  }

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-semibold text-foreground">Welcome back, {user?.firstName}!</h1>
              <p className="text-sm text-muted-foreground">{"Here's your financial overview for November 2025"}</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-popover-foreground">Add Transaction</DialogTitle>
                  <DialogDescription>Enter the details of your transaction</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div>
                    <Label htmlFor="type" className="text-popover-foreground">
                      Type
                    </Label>
                    <Select name="type" defaultValue="expense" required>
                      <SelectTrigger className="mt-1.5 border-input bg-background text-foreground">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover text-popover-foreground">
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-popover-foreground">
                      Transaction Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Grocery Store"
                      required
                      className="mt-1.5 border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-popover-foreground">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                      className="mt-1.5 border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-popover-foreground">
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      max={new Date().toISOString().split("T")[0]}
                      required
                      className="mt-1.5 border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-popover-foreground">
                      Category
                    </Label>
                    <Select name="category" required>
                      <SelectTrigger className="mt-1.5 border-input bg-background text-foreground">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover text-popover-foreground">
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Bills">Bills</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-input">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary text-primary-foreground">
                      Add Transaction
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Metric Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Income</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">${totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary">+0%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
                <TrendingDownIcon className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">${totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">+0%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Balance</CardTitle>
                <WalletIcon className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">${balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Available to spend</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Savings Rate</CardTitle>
                <SparklesIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{savingsRate}%</div>
                <p className="text-xs text-muted-foreground">Great job saving!</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Income vs Expenses Chart */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Income vs Expenses</CardTitle>
                <CardDescription>Last 6 months overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-64 flex-col justify-between text-xs text-muted-foreground">
                    <span>${Math.round(maxIncome)}</span>
                    <span>${Math.round(maxIncome * 0.75)}</span>
                    <span>${Math.round(maxIncome * 0.5)}</span>
                    <span>${Math.round(maxIncome * 0.25)}</span>
                    <span>$0</span>
                  </div>
                  <div className="ml-12 flex h-64 items-end justify-around gap-2">
                    {monthlyData.map((data, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex w-full items-end justify-center gap-1">
                          <div
                            className="w-full rounded-t bg-primary"
                            style={{ height: `${(data.income / maxIncome) * 200}px` }}
                            title={`Income: $${data.income.toFixed(2)}`}
                          />
                          <div
                            className="w-full rounded-t bg-destructive"
                            style={{ height: `${(data.expense / maxIncome) * 200}px` }}
                            title={`Expenses: $${data.expense.toFixed(2)}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-destructive" />
                    <span className="text-muted-foreground">expenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <span className="text-muted-foreground">income</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spending by Category */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Spending by Category</CardTitle>
                <CardDescription>{"This month's breakdown"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center">
                  <div className="relative h-48 w-48">
                    {totalCategorySpending > 0 && (
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        {
                          Object.entries(categorySpending)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .reduce(
                              (acc, [category, amount], i) => {
                                const percentage = (amount / totalCategorySpending) * 100
                                const circumference = 2 * Math.PI * 40
                                const dashArray = (percentage / 100) * circumference
                                const colors = ["#4ade80", "#60a5fa", "#34d399", "#fbbf24", "#f87171"]

                                acc.elements.push(
                                  <circle
                                    key={category}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={colors[i % colors.length]}
                                    strokeWidth="20"
                                    strokeDasharray={`${dashArray} ${circumference}`}
                                    strokeDashoffset={-acc.offset}
                                    strokeLinecap="round"
                                  />,
                                )
                                acc.offset += dashArray
                                return acc
                              },
                              { elements: [] as React.ReactNode[], offset: 0 },
                            ).elements
                        }
                      </svg>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(categorySpending)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, amount], i) => {
                      const percentage = ((amount / totalCategorySpending) * 100).toFixed(0)
                      const colors = ["#4ade80", "#60a5fa", "#34d399", "#fbbf24", "#f87171"]
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="text-sm text-muted-foreground">
                              {category} {percentage}%
                            </span>
                          </div>
                          <span className="text-sm text-card-foreground">${amount.toFixed(2)}</span>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Balance Trend */}
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-card-foreground">Balance Trend</CardTitle>
                <CardDescription>Your savings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-48">
                  <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-muted-foreground">
                    <span>${Math.round(maxBalance)}</span>
                    <span>${Math.round(maxBalance * 0.75)}</span>
                    <span>${Math.round(maxBalance * 0.5)}</span>
                    <span>${Math.round(maxBalance * 0.25)}</span>
                    <span>$0</span>
                  </div>
                  <div className="ml-12">
                    <svg className="h-48 w-full" viewBox="0 0 600 200">
                      <defs>
                        <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {balanceTrendData.length > 0 && (
                        <>
                          <path
                            d={balanceTrendData
                              .map((d, i) => {
                                const x = (i / (balanceTrendData.length - 1)) * 600
                                const y = 200 - (d.balance / maxBalance) * 180
                                return `${i === 0 ? "M" : "L"} ${x} ${y}`
                              })
                              .join(" ")}
                            fill="none"
                            stroke="#4ade80"
                            strokeWidth="2"
                          />
                          <path
                            d={
                              balanceTrendData
                                .map((d, i) => {
                                  const x = (i / (balanceTrendData.length - 1)) * 600
                                  const y = 200 - (d.balance / maxBalance) * 180
                                  return `${i === 0 ? "M" : "L"} ${x} ${y}`
                                })
                                .join(" ") + " L 600 200 L 0 200 Z"
                            }
                            fill="url(#balanceGradient)"
                          />
                          {balanceTrendData.map((d, i) => {
                            const x = (i / (balanceTrendData.length - 1)) * 600
                            const y = 200 - (d.balance / maxBalance) * 180
                            return <circle key={i} cx={x} cy={y} r="4" fill="#4ade80" />
                          })}
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="ml-12 mt-2 flex justify-between text-xs text-muted-foreground">
                    {balanceTrendData.map((d) => (
                      <span key={d.month}>{d.month}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
                <CardDescription>Last 5 activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-card-foreground">{transaction.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} •{" "}
                          {transaction.category}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          transaction.amount > 0 ? "text-primary" : "text-foreground",
                        )}
                      >
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
