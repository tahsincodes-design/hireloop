import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsView } from "@/components/dashboard/settings-view"
import { checkApiConnection } from "@/lib/api/dashboard"
import { requireSessionUser } from "@/lib/auth/session"

export async function SettingsPageView({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  const user = await requireSessionUser()
  const connection = await checkApiConnection()

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <SettingsView user={user} role={user.role} connection={connection} />
    </div>
  )
}
