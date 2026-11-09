"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu"
import { HelpDialog } from "@/components/dashboard/help-dialog"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { getPageTitle } from "@/lib/dashboard/navigation"
import type { UserRole } from "@/lib/roles"
import type { AuthUser } from "@/types/user"

function searchTarget(role: UserRole) {
  if (role === "seeker") {
    return {
      href: "/dashboard/seeker/jobs",
      placeholder: "Search jobs…",
    }
  }
  if (role === "recruiter") {
    return {
      href: "/dashboard/recruiter/candidates",
      placeholder: "Search candidates…",
    }
  }
  return {
    href: "/dashboard/admin/users",
    placeholder: "Search users…",
  }
}

export function DashboardHeader({
  user,
  role,
  unreadCount,
  onUnreadCountChange,
  onOpenMobile,
}: {
  user: AuthUser
  role: UserRole
  unreadCount: number
  onUnreadCountChange: (count: number) => void
  onOpenMobile: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const pageTitle = getPageTitle(role, pathname)
  const target = searchTarget(role)

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(
      trimmed ? `${target.href}?q=${encodeURIComponent(trimmed)}` : target.href
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-[#06060b]/88 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onOpenMobile}
          className="text-white/55 hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="hidden text-[10px] font-medium tracking-[0.16em] text-white/25 uppercase sm:block">
            Dashboard
          </p>
          <h1 className="truncate font-manrope text-[15px] font-semibold text-white sm:text-base">
            {pageTitle}
          </h1>
        </div>

        <form
          onSubmit={handleSearch}
          className="relative hidden w-full max-w-xs items-center md:flex"
          role="search"
        >
          <Search
            className="pointer-events-none absolute left-2.5 size-3.5 text-white/30"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={target.placeholder}
            aria-label={target.placeholder}
            className="h-9 rounded-xl border-white/8 bg-white/[0.03] pl-8 text-xs text-white placeholder:text-white/25 focus-visible:border-indigo-400/40 focus-visible:ring-indigo-400/15 dark:bg-white/[0.03]"
          />
        </form>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <NotificationBell
            role={role}
            unreadCount={unreadCount}
            onUnreadCountChange={onUnreadCountChange}
          />
          <HelpDialog role={role} />
          <div className="mx-1 hidden h-6 w-px bg-white/8 sm:block" />
          <DashboardUserMenu user={user} role={role} />
        </div>
      </div>
    </header>
  )
}
