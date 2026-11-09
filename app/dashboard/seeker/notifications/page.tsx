import type { Metadata } from "next"

import { NotificationsView } from "@/components/dashboard/notifications-view"
import { loadNotifications } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Notifications · HireLoop",
}

export default async function SeekerNotificationsPage() {
  const section = await loadNotifications()

  return (
    <NotificationsView
      eyebrow="Notifications"
      title="Stay up to date"
      description="Everything that changed across your applications and interviews."
      section={section}
    />
  )
}
