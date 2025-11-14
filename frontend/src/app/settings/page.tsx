"use client"

import React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreditCard, Lock, Bell, Moon, Trash2 } from "lucide-react"
import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

export default function SettingsPage() {
  const { isCollapsed } = useSidebar()
  const { theme, toggleTheme } = useTheme()

  // Component variables to work around React 19 type compatibility
  const CreditCardIcon = CreditCard as React.ComponentType<{ className?: string }>
  const LockIcon = Lock as React.ComponentType<{ className?: string }>
  const BellIcon = Bell as React.ComponentType<{ className?: string }>
  const MoonIcon = Moon as React.ComponentType<{ className?: string }>
  const Trash2Icon = Trash2 as React.ComponentType<{ className?: string }>

  return (
    <div className={theme}>
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
              <h1 className="mb-1 text-2xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>

            <div className="mx-auto max-w-3xl space-y-6">
              {/* Profile Information */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 bg-primary text-primary-foreground">
                      <AvatarFallback className="text-lg font-semibold">SV</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName" className="text-card-foreground">
                        First Name
                      </Label>
                      <Input id="firstName" defaultValue="Suraj" className="mt-1.5 bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-card-foreground">
                        Last Name
                      </Label>
                      <Input id="lastName" defaultValue="Vinti" className="mt-1.5 bg-background" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-card-foreground">
                      Email Address
                    </Label>
                    <div className="mt-1.5 flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        defaultValue="suraj.vinti@email.com"
                        className="flex-1 bg-background"
                      />
                      <Button variant="outline">Verify</Button>
                    </div>
                  </div>

                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Security</CardTitle>
                  <CardDescription>Manage your password and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <LockIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground">Password</div>
                        <div className="text-sm text-muted-foreground">Last changed 3 months ago</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <BellIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-card-foreground">Two-Factor Authentication</div>
                          <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                        </div>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Linked Accounts */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Linked Accounts</CardTitle>
                  <CardDescription>Manage your connected bank accounts and cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Chase Checking ••••4521", time: "Connected 2 months ago" },
                    { name: "Visa Card ••••8392", time: "Connected 5 months ago" },
                  ].map((account, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <CreditCardIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.time}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent">
                    + Add New Account
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Notifications</CardTitle>
                  <CardDescription>Configure how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      icon: BellIcon,
                      title: "Email Notifications",
                      description: "Receive updates via email",
                      enabled: true,
                    },
                    {
                      icon: BellIcon,
                      title: "Push Notifications",
                      description: "Receive push notifications",
                      enabled: false,
                    },
                    {
                      icon: BellIcon,
                      title: "Budget Alerts",
                      description: "Notify when approaching budget limits",
                      enabled: true,
                    },
                    {
                      icon: BellIcon,
                      title: "Goal Reminders",
                      description: "Weekly progress updates on goals",
                      enabled: true,
                    },
                  ].map((item, i) => {
                    const IconComponent = item.icon as React.ComponentType<{ className?: string }>
                    return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-card-foreground">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Appearance</CardTitle>
                  <CardDescription>Customize how SpendSmart looks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MoonIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-card-foreground">Dark Mode</div>
                        <div className="text-sm text-muted-foreground">
                          {theme === "dark" ? "Dark theme enabled" : "Light theme enabled"}
                        </div>
                      </div>
                    </div>
                    <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-card-foreground">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
