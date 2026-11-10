"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { authClient } from "@/lib/auth-client"
import {
  getNavigationForRole,
  getFlatNavigation,
  ROLE_META,
} from "@/lib/dashboard/navigation"
import type { UserRole } from "@/lib/roles"
import type { AuthUser } from "@/types/user"
import { cn } from "@/lib/utils"

function profileHref(role: UserRole) {
  if (role === "seeker") return "/dashboard/seeker/profile"
  if (role === "recruiter") return "/dashboard/recruiter/company"
  return "/dashboard/admin/settings"
}

function settingsHref(role: UserRole) {
  return `/dashboard/${role}/settings`
}

function SidebarBody({
  user,
  role,
  collapsed = false,
  unreadCount = 0,
  onNavigate,
  onToggleCollapsed,
}: {
  user: AuthUser
  role: UserRole
  collapsed?: boolean
  unreadCount?: number
  onNavigate?: () => void
  onToggleCollapsed?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const groups = getNavigationForRole(role)
  const allItems = getFlatNavigation(role)
  const exactMatch = allItems.find((item) => item.href === pathname)
  const roleMeta = ROLE_META[role]

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authClient.signOut()
      onNavigate?.()
      router.push("/sign-in")
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  function isActive(href: string) {
    if (exactMatch) return href === exactMatch.href
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/6 px-4",
          collapsed ? "justify-center px-2" : "justify-between gap-2"
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
          aria-label="HireLoop home"
          title="HireLoop home"
        >
          {collapsed ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
              H
            </span>
          ) : (
            <Image
              src="/images/logo.png"
              alt="HireLoop"
              width={154}
              height={44}
              priority
              className="h-8 w-auto"
            />
          )}
        </Link>

        {onToggleCollapsed && !collapsed ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapsed}
            className="text-white/35 hover:bg-white/[0.06] hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {onToggleCollapsed && collapsed ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapsed}
            className="text-white/35 hover:bg-white/[0.06] hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      <nav
        className="flex-1 overflow-y-auto px-2.5 py-4"
        aria-label="Dashboard navigation"
      >
        <div className="mb-3">
          <Link
            href="/"
            onClick={onNavigate}
            title={collapsed ? "Go to Home" : undefined}
            className={cn(
              "group relative flex items-center rounded-lg text-[13px] font-medium transition-colors",
              collapsed
                ? "mx-auto size-10 justify-center text-white/50 hover:bg-white/[0.045] hover:text-white"
                : "gap-2.5 px-2.5 py-2 text-white/60 hover:bg-white/[0.045] hover:text-white"
            )}
          >
            <Home
              className="size-4 shrink-0 text-white/40 group-hover:text-white/80"
              aria-hidden="true"
            />
            {!collapsed ? (
              <span className="min-w-0 flex-1 truncate">Home</span>
            ) : null}
          </Link>
        </div>

        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="px-2.5 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-white/25 uppercase">
                  {group.label}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-white/8" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  const showBadge =
                    item.badgeKey === "notifications" && unreadCount > 0

                  return (
                    <li key={item.href} className="relative">
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.title : undefined}
                        className={cn(
                          "group relative flex items-center rounded-lg text-[13px] font-medium transition-colors",
                          collapsed
                            ? "mx-auto size-10 justify-center"
                            : "gap-2.5 px-2.5 py-2",
                          active
                            ? "bg-indigo-500/12 text-white"
                            : "text-white/50 hover:bg-white/[0.045] hover:text-white/85"
                        )}
                      >
                        {active ? (
                          <span
                            className={cn(
                              "absolute top-1/2 -left-2.5 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-400",
                              collapsed && "-left-1"
                            )}
                            aria-hidden="true"
                          />
                        ) : null}
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            active
                              ? "text-indigo-300"
                              : "text-white/35 group-hover:text-white/65"
                          )}
                          aria-hidden="true"
                        />
                        {!collapsed ? (
                          <>
                            <span className="min-w-0 flex-1 truncate">
                              {item.title}
                            </span>
                            {showBadge ? (
                              <span className="flex min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] leading-4 font-semibold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            ) : null}
                          </>
                        ) : showBadge ? (
                          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-indigo-400 ring-2 ring-[#08080e]" />
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/6 p-2.5">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/"
              onClick={onNavigate}
              title="Go to Home"
              className="flex size-8 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Home className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
            <Link
              href={profileHref(role)}
              onClick={onNavigate}
              title={user.name}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
            >
              <UserAvatar name={user.name} image={user.image} />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              className="text-white/30 hover:bg-white/[0.06] hover:text-rose-300"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2.5">
              <UserAvatar name={user.name} image={user.image} />
              <Link
                href={profileHref(role)}
                onClick={onNavigate}
                className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
              >
                <span className="block truncate text-[13px] font-medium text-white">
                  {user.name}
                </span>
                <span className="block truncate text-[11px] text-white/35">
                  {roleMeta.label}
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-white/30 hover:bg-white/[0.06] hover:text-rose-300"
                aria-label="Sign out"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-2 flex gap-1 border-t border-white/6 pt-2">
              <Link
                href="/"
                onClick={onNavigate}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80"
              >
                <Home className="size-3" aria-hidden="true" />
                Home
              </Link>
              <Link
                href={profileHref(role)}
                onClick={onNavigate}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80"
              >
                {role === "recruiter" ? (
                  <Building2 className="size-3" aria-hidden="true" />
                ) : (
                  <UserRound className="size-3" aria-hidden="true" />
                )}
                Profile
              </Link>
              <Link
                href={settingsHref(role)}
                onClick={onNavigate}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80"
              >
                <Settings className="size-3" aria-hidden="true" />
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardSidebar({
  user,
  role,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
  unreadCount,
}: {
  user: AuthUser
  role: UserRole
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  unreadCount: number
}) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/6 bg-[#08080e] transition-[width] duration-200 lg:flex",
          collapsed ? "w-[84px]" : "w-[272px]"
        )}
      >
        <SidebarBody
          user={user}
          role={role}
          collapsed={collapsed}
          unreadCount={unreadCount}
          onToggleCollapsed={onToggleCollapsed}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[288px] gap-0 border-r border-white/8 bg-[#08080e] p-0 text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard navigation</SheetTitle>
          </SheetHeader>
          <SidebarBody
            user={user}
            role={role}
            unreadCount={unreadCount}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
