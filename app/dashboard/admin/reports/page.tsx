import type { Metadata } from "next"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { ReportsTable } from "@/components/dashboard/reports-table"
import { loadReports } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Reports & Moderation · HireLoop",
}

export default async function AdminReportsPage() {
  const section = await loadReports()

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="Reports & moderation"
        description="Review flagged users, jobs, and applications. Status changes are recorded by the Express API."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : (
        <ReportsTable reports={section.data ?? []} />
      )}
    </div>
  )
}
