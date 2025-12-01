import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-foreground">SpendSmart</div>
              <div className="text-xs text-muted-foreground">by Prodevism</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/login">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            Built for students & young adults
          </div>
          <h1 className="mb-4 text-balance text-5xl font-bold leading-tight text-foreground md:text-6xl">
            Track your spending.
            <br />
            <span className="text-primary">Reach your goals.</span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            SpendSmart helps you take control of your finances with intuitive tracking, smart insights, and motivating
            goal management.
          </p>
          <Button size="lg" asChild className="bg-primary text-base hover:bg-primary/90">
            <Link href="/login">Get Started →</Link>
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="border-b bg-muted px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">Dashboard</div>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Dashboard</div>
                  <div className="text-xl font-semibold text-foreground">Your financial overview</div>
                </div>
                <div className="h-10 w-32 rounded-lg bg-primary/10" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Income</div>
                  <div className="h-8 w-24 rounded bg-muted" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Expenses</div>
                  <div className="h-8 w-24 rounded bg-muted" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Balance</div>
                  <div className="h-8 w-24 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="mb-4 h-4 w-32 rounded bg-muted" />
                  <div className="flex h-48 items-end gap-2">
                    <div className="h-20 w-full rounded-t bg-primary/30" />
                    <div className="h-32 w-full rounded-t bg-primary/30" />
                    <div className="h-28 w-full rounded-t bg-primary/30" />
                    <div className="h-40 w-full rounded-t bg-primary/30" />
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-4 h-4 w-32 rounded bg-muted" />
                  <div className="flex h-48 items-center justify-center">
                    <div className="relative h-40 w-40">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold text-muted-foreground">$</div>
                      </div>
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          className="text-muted"
                          strokeWidth="12"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          className="text-primary"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset="75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
