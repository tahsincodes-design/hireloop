import type { Metadata } from "next"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { JobTable } from "@/components/dashboard/job-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { loadJobs } from "@/lib/api/dashboard"
import { Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "Job Management · HireLoop",
}

export default async function AdminJobsPage() {
  const section = await loadJobs({ scope: "all" })
  const jobs = section.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Platform"
        title="Job management"
        description="Approve, reject, suspend, or remove any listing on the marketplace."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs on the platform"
          description="Recruiters have not published any roles yet."
        />
      ) : (
        <JobTable jobs={jobs} variant="admin" />
      )}
    </div>
  )
}
