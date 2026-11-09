import type { Metadata } from "next"

import { NotificationsView } from "@/components/dashboard/notifications-view"
import { loadNotifications } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Notifications · HireLoop",
}

export default async function RecruiterNotificationsPage() {
  const section = await loadNotifications()

  return (
    <NotificationsView
      eyebrow="Notifications"
      title="Recruiting updates"
      description="New applicants, interview changes, and platform announcements."
      section={section}
    />
  )
}
