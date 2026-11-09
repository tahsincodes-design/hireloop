import type { Metadata } from "next"
import { Briefcase, Search } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { JobCard } from "@/components/dashboard/job-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchForm } from "@/components/dashboard/search-form"
import { loadJobs, loadSavedJobs } from "@/lib/api/dashboard"
import { getSavedJobIds } from "@/lib/dashboard/stats"
import {
  firstParam,
  type DashboardSearchParams,
} from "@/lib/dashboard/search-params"

export const metadata: Metadata = {
  title: "Find Jobs · HireLoop",
}

export default async function SeekerJobsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const params = await searchParams
  const query = firstParam(params.q)?.trim() ?? ""

  const [jobsSection, savedSection] = await Promise.all([
    loadJobs({ scope: "all", search: query || undefined }),
    loadSavedJobs(),
  ])

  const jobs = jobsSection.data ?? []
  const savedIds = getSavedJobIds(savedSection.data ?? [])
  const failures = [jobsSection.failure, savedSection.failure].filter(
    (failure) => failure !== null
  )

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Job search"
        title="Find your next role"
        description="Browse every published role on HireLoop. Save the ones you like and apply when you are ready."
      />

      <ApiNotice failures={failures} />

      <SearchForm
        action="/dashboard/seeker/jobs"
        defaultValue={query}
        placeholder="Search by title, company, location, or category…"
        label="Search jobs"
      />

      <div className="flex items-center justify-between gap-2 text-[11px] text-white/35">
        <p>
          {jobsSection.ok
            ? `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} found`
            : "Job listings are unavailable"}
          {query ? ` for “${query}”` : ""}
        </p>
        <p>{savedSection.ok ? `${savedIds.size} saved` : ""}</p>
      </div>

      {jobsSection.failure ? (
        <ErrorState failure={jobsSection.failure} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Search}
          title={query ? "No matching jobs" : "No open roles yet"}
          description={
            query
              ? "Try a broader search term or clear your search."
              : "New roles will appear here as soon as recruiters publish them."
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedIds.has(job.id) || job.saved === true}
            />
          ))}
        </div>
      )}

      {!jobsSection.ok && !jobsSection.failure ? (
        <EmptyState
          icon={Briefcase}
          title="No response from the jobs API"
          description="The jobs endpoint returned an empty response."
        />
      ) : null}
    </div>
  )
}
