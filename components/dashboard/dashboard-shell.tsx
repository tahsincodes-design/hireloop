"use client"

import { useState } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { UserRole } from "@/lib/roles"
import type { AuthUser } from "@/types/user"
import { cn } from "@/lib/utils"

export function DashboardShell({
  user,
  role,
  children,
}: {
  user: AuthUser
  role: UserRole
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  function toggleCollapsed() {
    setCollapsed((current) => !current)
  }

  return (
    <TooltipProvider delay={250}>
      <div className="min-h-svh bg-[#05050a] text-white">
        <a
          href="#dashboard-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-indigo-500 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>

        <DashboardSidebar
          user={user}
          role={role}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          unreadCount={unreadCount}
        />

        <div
          className={cn(
            "flex min-h-svh flex-col transition-[padding] duration-200",
            collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]"
          )}
        >
          <DashboardHeader
            user={user}
            role={role}
            unreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
            onOpenMobile={() => setMobileOpen(true)}
          />

          <main
            id="dashboard-main"
            className="flex-1 bg-[radial-gradient(90%_60%_at_50%_-10%,rgba(99,102,241,0.06),transparent_65%)] px-4 py-6 sm:px-6 lg:px-8"
          >
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>

          <footer className="border-t border-white/6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
              <p>HireLoop · {user.role} workspace</p>
              <p>
                Session secured with Better Auth · Data served by the Express
                API
              </p>
            </div>
          </footer>
        </div>

        <Toaster position="top-right" richColors closeButton />
      </div>
    </TooltipProvider>
  )
}
