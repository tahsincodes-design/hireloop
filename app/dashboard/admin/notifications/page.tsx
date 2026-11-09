import type { Metadata } from "next"

import { NotificationsView } from "@/components/dashboard/notifications-view"
import { loadNotifications } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Notifications · HireLoop",
}

export default async function AdminNotificationsPage() {
  const section = await loadNotifications()

  return (
    <NotificationsView
      eyebrow="Account"
      title="Platform notifications"
      description="Moderation alerts, account activity, and system announcements."
      section={section}
    />
  )
}
