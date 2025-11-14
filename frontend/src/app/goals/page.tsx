"use client"

// AI-GENERATED (Cursor AI Assistant), 2025-01-XX
// Prompt: "Update the goals page to use the backend API instead of local state. It should
// fetch goals on mount, create goals via API, handle schema conversion between frontend
// format (name, target, deadline) and backend format (category, targetAmount, startDate, endDate),
// and calculate goal progress from transactions."
//
// Modifications by Abhishek:
// - Replaced local state with backend API integration
// - Added schema conversion (name→category, target→targetAmount, deadline→startDate/endDate)
// - Added deadline parsing function to convert "Dec 2026" format to ISO dates
// - Added goal progress calculation from transactions in the goal's category
// - Fixed React 19 type compatibility issues with lucide-react icons
// - Fixed TypeScript form reset errors by storing form reference

import React, { useState, useEffect } from "react"
import type { LucideIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Target } from "lucide-react"
import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
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
import { fetchGoals, createGoal, type ApiGoal } from "@/lib/api"
import { useTransactions } from "@/components/transaction-provider"

// Frontend goal interface (includes UI-specific fields)
interface FrontendGoal {
  id: string
  name: string
  target: number
  current: number // Calculated from transactions
  deadline: string
  icon: LucideIcon
  color: string
  bgColor: string
  message: string
  category: string
}

export default function GoalsPage() {
  const { isCollapsed } = useSidebar()
  const { transactions } = useTransactions()
  const [open, setOpen] = useState(false)
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [goals, setGoals] = useState<FrontendGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Component variables to work around React 19 type compatibility
  const TargetIcon = Target as React.ComponentType<{ className?: string }>
  const PlusIcon = Plus as React.ComponentType<{ className?: string }>

  // Convert API goal to frontend goal format
  const apiToFrontend = (apiGoal: ApiGoal, transactions: any[]): FrontendGoal => {
    // Calculate current amount from transactions in this category
    // Note: This is a simplified calculation - you might want to filter by date range too
    const current = Math.abs(
      transactions
        .filter((t) => t.category === apiGoal.category && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    )

    const progress = apiGoal.targetAmount > 0 ? Math.round((current / apiGoal.targetAmount) * 100) : 0
    let message = "🎯 Great start! Keep it up!"
    if (progress >= 100) message = "🎉 Goal achieved! Amazing work!"
    else if (progress >= 75) message = "🔥 Almost there! You're doing great!"
    else if (progress >= 50) message = "💪 Halfway there! Keep going!"
    else if (progress >= 25) message = "📈 Making progress! Stay motivated!"

    return {
      id: apiGoal.id,
      name: apiGoal.category, // Use category as name
      target: apiGoal.targetAmount,
      current,
      deadline: new Date(apiGoal.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      icon: Target,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      message,
      category: apiGoal.category,
    }
  }

  // Load goals from backend
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const apiGoals = await fetchGoals()
        const frontendGoals = apiGoals.map((goal) => apiToFrontend(goal, transactions))
        setGoals(frontendGoals)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load goals"
        setError(errorMessage)
        console.error("Error loading goals:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGoals()
  }, [transactions])

  // Parse deadline string to endDate (e.g., "Dec 2026" -> "2026-12-31")
  const parseDeadline = (deadline: string): string => {
    // Try to parse formats like "Dec 2026", "December 2026", "2026-12"
    const parts = deadline.trim().split(/\s+/)
    if (parts.length >= 2) {
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ]
      const monthShort = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      const monthStr = parts[0].toLowerCase()
      const yearStr = parts[1]

      let month = monthShort.indexOf(monthStr)
      if (month === -1) {
        month = monthNames.indexOf(monthStr)
      }

      if (month !== -1 && yearStr) {
        const year = parseInt(yearStr, 10)
        if (!isNaN(year)) {
          // Set to last day of the month
          const date = new Date(year, month + 1, 0)
          return date.toISOString().split("T")[0]
        }
      }
    }
    // Fallback: if parsing fails, use the string as-is (assuming it's already a date)
    return deadline
  }

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0)
  const percentageComplete = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = formData.get("name") as string
    const target = Number.parseFloat(formData.get("target") as string)
    const deadline = formData.get("deadline") as string

    try {
      setError(null)
      const endDate = parseDeadline(deadline)
      const startDate = new Date().toISOString().split("T")[0] // Start from today

      const apiGoal: Omit<ApiGoal, "id" | "createdAt" | "updatedAt"> = {
        category: name,
        targetAmount: target,
        startDate,
        endDate,
        period: "monthly",
      }

      const created = await createGoal(apiGoal)
      const frontendGoal = apiToFrontend(created, transactions)
      setGoals([...goals, frontendGoal])
      setOpen(false)
      form.reset()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create goal"
      setError(errorMessage)
      console.error("Error creating goal:", err)
    }
  }

  const handleAddFunds = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    // Note: The backend doesn't have a "current" field for goals.
    // The current amount is calculated from transactions.
    // Adding funds would actually mean creating a transaction in that category.
    // For now, we'll just close the dialog and show a message.
    setAddFundsOpen(false)
    setSelectedGoalId(null)
    form.reset()
    // TODO: In the future, this could create a transaction in the goal's category
    alert("To add funds to a goal, create a transaction in that category. This feature will be enhanced in the future.")
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
              <h1 className="mb-1 text-2xl font-semibold text-foreground">Your Goals</h1>
              <p className="text-sm text-muted-foreground">Track your progress and stay motivated</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-popover-foreground">Add New Goal</DialogTitle>
                  <DialogDescription>Set a new savings goal to track your progress</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-popover-foreground">
                      Goal Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Emergency Fund"
                      required
                      className="mt-1.5 border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target" className="text-popover-foreground">
                      Target Amount
                    </Label>
                    <Input
                      id="target"
                      name="target"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      required
                      className="mt-1.5 border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline" className="text-popover-foreground">
                      Target Date
                    </Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      placeholder="e.g., Dec 2026"
                      required
                      className="mt-1.5 border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-input">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary text-primary-foreground">
                      Create Goal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">{goals.length}</div>
                <p className="text-xs text-muted-foreground">Active savings goals</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">${totalTarget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Combined goal amount</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">${totalSaved.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{percentageComplete}% of total target</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-8 text-center text-muted-foreground">Loading goals...</div>
          )}

          {/* Goals Grid */}
          {!isLoading && goals.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <TargetIcon className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">No Goals Yet</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Start by creating your first savings goal
                </p>
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {goals.map((goal) => {
                const progress = Math.round((goal.current / goal.target) * 100)
                const remaining = goal.target - goal.current

                return (
                  <Card key={goal.id} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${goal.bgColor}`}>
                            {React.createElement(goal.icon as React.ComponentType<{ className?: string }>, { className: `h-5 w-5 ${goal.color}` })}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-card-foreground">{goal.name}</CardTitle>
                            <CardDescription className="text-xs">🎯 Target: {goal.deadline}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Current</div>
                          <div className="text-xl font-bold text-primary">${goal.current.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Target</div>
                          <div className="text-xl font-bold text-card-foreground">${goal.target.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">${remaining.toLocaleString()} to go</div>

                      <Button
                        className="w-full bg-transparent"
                        variant="outline"
                        onClick={() => {
                          setSelectedGoalId(goal.id)
                          setAddFundsOpen(true)
                        }}
                      >
                        Add Funds
                      </Button>

                      <div className="rounded-lg bg-primary/10 p-3 text-center text-sm text-primary">
                        {goal.message}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Add Funds Dialog */}
          <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
            <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-popover-foreground">Add Funds</DialogTitle>
                <DialogDescription>Add money to {goals.find((g) => g.id === selectedGoalId)?.name}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-popover-foreground">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    required
                    className="mt-1.5 border-input bg-background text-foreground"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddFundsOpen(false)}
                    className="border-input"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Add Funds
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Tips Section */}
          <Card className="mt-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Tips for Reaching Your Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-2 text-2xl">💡</div>
                  <h3 className="mb-1 font-medium text-card-foreground">Set Realistic Targets</h3>
                  <p className="text-sm text-muted-foreground">
                    Break down large goals into smaller, achievable milestones
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-2 text-2xl">📅</div>
                  <h3 className="mb-1 font-medium text-card-foreground">Automate Savings</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up automatic transfers to your savings goals each month
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-2 text-2xl">🎯</div>
                  <h3 className="mb-1 font-medium text-card-foreground">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your goals weekly to stay motivated and on track
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
