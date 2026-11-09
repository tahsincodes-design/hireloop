"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  BellRing,
  Briefcase,
  CalendarDays,
  CheckCheck,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/dashboard/empty-state"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { formatDateTime } from "@/lib/format"
import type { AppNotification } from "@/types/notification"
import { cn } from "@/lib/utils"

const TYPE_ICON = {
  application: Briefcase,
  interview: CalendarDays,
  job: Mail,
  system: ShieldCheck,
} as const

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
] as const

export function NotificationsList({
  notifications,
}: {
  notifications: AppNotification[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(notifications)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const unreadCount = items.filter((item) => !item.read).length
  const visible =
    filter === "unread" ? items.filter((item) => !item.read) : items

  async function markRead(notification: AppNotification) {
    if (notification.read || pendingId) return
    setPendingId(notification.id)

    try {
      await api.patch(endpoints.notificationRead(notification.id))
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      )
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not mark the notification as read.")
    } finally {
      setPendingId(null)
    }
  }

  async function markAllRead() {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)

    try {
      await api.patch(endpoints.notificationsReadAll)
      setItems((current) => current.map((item) => ({ ...item, read: true })))
      notifySuccess("All notifications marked as read")
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not mark all notifications as read.")
    } finally {
      setMarkingAll(false)
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        description="Updates about applications, interviews, and platform activity will appear here."
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.02] p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === item.value
                  ? "bg-indigo-500/15 text-indigo-200"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              )}
            >
              {item.label}
              {item.value === "unread" && unreadCount > 0
                ? ` (${unreadCount})`
                : ""}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={markAllRead}
          disabled={markingAll || unreadCount === 0}
          className="text-[11px] text-white/45 hover:bg-white/[0.06] hover:text-white"
        >
          {markingAll ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCheck className="size-3.5" aria-hidden="true" />
          )}
          Mark all read
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="You're all caught up"
          description="You have no unread notifications right now."
          compact
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((notification) => {
            const Icon = TYPE_ICON[notification.type] ?? Bell
            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                  notification.read
                    ? "border-white/6 bg-white/[0.015]"
                    : "border-indigo-400/15 bg-indigo-400/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                    notification.read
                      ? "border-white/8 bg-white/[0.03] text-white/40"
                      : "border-indigo-400/15 bg-indigo-400/10 text-indigo-300"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-[13px]",
                        notification.read
                          ? "font-normal text-white/60"
                          : "font-medium text-white"
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.read ? (
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[10px] text-white/25">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            )

            return (
              <li key={notification.id}>
                {notification.href ? (
                  <Link
                    href={notification.href}
                    onClick={() => markRead(notification)}
                    className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(notification)}
                    className="block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                  >
                    {content}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
