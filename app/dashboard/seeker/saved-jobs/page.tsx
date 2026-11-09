import type { Metadata } from "next"
import Link from "next/link"
import { Bookmark } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { JobCard } from "@/components/dashboard/job-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { loadSavedJobs } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Saved Jobs · HireLoop",
}

export default async function SeekerSavedJobsPage() {
  const section = await loadSavedJobs()
  const savedJobs = section.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Saved jobs"
        title="Roles worth revisiting"
        description="Every job you bookmarked, ready when you are."
        actions={
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Browse more jobs
          </Link>
        }
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Tap the bookmark icon on any job to keep it here for later."
          action={
            <Link
              href="/dashboard/seeker/jobs"
              className="text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              Explore jobs
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {savedJobs.map((saved) => (
            <JobCard key={saved.id} job={saved.job} saved />
          ))}
        </div>
      )}
    </div>
  )
}
