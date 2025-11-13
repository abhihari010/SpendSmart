"use client"

import type React from "react"

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
import { useState } from "react"

export default function GoalsPage() {
  const { isCollapsed } = useSidebar()
  const [open, setOpen] = useState(false)
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [goals, setGoals] = useState<
    Array<{
      id: number
      name: string
      target: number
      current: number
      deadline: string
      icon: any
      color: string
      bgColor: string
      message: string
    }>
  >([])

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0)
  const percentageComplete = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newGoal = {
      id: goals.length + 1,
      name: formData.get("name") as string,
      target: Number.parseFloat(formData.get("target") as string),
      current: 0,
      deadline: formData.get("deadline") as string,
      icon: Target,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      message: "🎯 Great start! Keep it up!",
    }
    setGoals([...goals, newGoal])
    setOpen(false)
    e.currentTarget.reset()
  }

  const handleAddFunds = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const amount = Number.parseFloat(formData.get("amount") as string)

    setGoals(
      goals.map((goal) =>
        goal.id === selectedGoalId ? { ...goal, current: Math.min(goal.current + amount, goal.target) } : goal,
      ),
    )

    setAddFundsOpen(false)
    setSelectedGoalId(null)
    e.currentTarget.reset()
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
                  <Plus className="mr-2 h-4 w-4" />
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

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Target className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">No Goals Yet</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Start by creating your first savings goal
                </p>
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
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
                            <goal.icon className={`h-5 w-5 ${goal.color}`} />
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
