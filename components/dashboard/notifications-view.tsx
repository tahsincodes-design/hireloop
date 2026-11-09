import { ApiNotice } from "@/components/dashboard/api-notice"
import { ErrorState } from "@/components/dashboard/error-state"
import { NotificationsList } from "@/components/dashboard/notifications-list"
import { PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import type { ApiSection } from "@/lib/api/dashboard"
import type { AppNotification } from "@/types/notification"

export function NotificationsView({
  eyebrow,
  title,
  description,
  section,
}: {
  eyebrow: string
  title: string
  description: string
  section: ApiSection<AppNotification[]>
}) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <SectionCard
        title="Notifications"
        description="Application updates, interviews, and platform announcements."
      >
        {section.failure ? (
          <ErrorState failure={section.failure} />
        ) : (
          <NotificationsList notifications={section.data ?? []} />
        )}
      </SectionCard>
    </div>
  )
}
