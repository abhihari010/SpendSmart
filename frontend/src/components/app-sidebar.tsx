"use client"

import { LayoutDashboard, Target, Lightbulb, Settings, LogOut, Wallet, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-provider"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Lightbulb, label: "Insights", href: "/insights" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        <Link href="/dashboard" className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="font-semibold text-sidebar-foreground">SpendSmart</div>
              <div className="text-xs text-sidebar-foreground/60">by Prodevism</div>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center border-b border-sidebar-border p-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && <div className="mb-2 px-3 text-xs font-medium text-sidebar-foreground/60">Menu</div>}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  isCollapsed && "justify-center",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/"
          title={isCollapsed ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && "Sign Out"}
        </Link>
      </div>
    </div>
  )
}
