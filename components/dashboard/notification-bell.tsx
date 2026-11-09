"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { api } from "@/lib/api/client"
import { normalizeNotification, unwrapList } from "@/lib/api/normalize"
import type { UserRole } from "@/lib/roles"

function notificationsHref(role: UserRole) {
  return `/dashboard/${role}/notifications`
}

export function NotificationBell({
  role,
  unreadCount,
  onUnreadCountChange,
}: {
  role: UserRole
  unreadCount: number
  onUnreadCountChange: (count: number) => void
}) {
  useEffect(() => {
    let cancelled = false

    api
      .get<unknown>("/notifications", { timeoutMs: 4_000 })
      .then((payload) => {
        if (cancelled) return
        const unread = unwrapList(payload, ["notifications"])
          .map(normalizeNotification)
          .filter((item) => item !== null && !item.read).length
        onUnreadCountChange(unread)
      })
      .catch(() => {
        if (!cancelled) onUnreadCountChange(0)
      })

    return () => {
      cancelled = true
    }
  }, [onUnreadCountChange])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={notificationsHref(role)}
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            className="relative inline-flex size-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:outline-none"
          />
        }
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex min-w-3.5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px] leading-3.5 font-semibold text-white ring-2 ring-[#06060b]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>Notifications</TooltipContent>
    </Tooltip>
  )
}
