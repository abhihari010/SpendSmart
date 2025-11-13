"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">SpendSmart</div>
            <div className="text-sm text-muted-foreground">by Prodevism</div>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-foreground">Welcome</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account or create a new one</p>
          </div>

          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("login")}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === "signup"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {activeTab === "login" ? (
            // Login Form
            <form className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="mt-1.5" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" asChild>
                <Link href="/dashboard">Log In</Link>
              </Button>
            </form>
          ) : (
            // Sign Up Form
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" type="text" placeholder="John" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" type="text" placeholder="Doe" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="signupEmail">Email</Label>
                <Input id="signupEmail" type="email" placeholder="you@example.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="signupPassword">Password</Label>
                <Input id="signupPassword" type="password" placeholder="••••••••" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" className="mt-1.5" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" asChild>
                <Link href="/dashboard">Sign Up</Link>
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-transparent" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full bg-transparent" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#00a4ef" />
                <rect x="1" y="11" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              Microsoft
            </Button>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
