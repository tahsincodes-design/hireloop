import type { Metadata } from "next"
import Link from "next/link"
import { Briefcase, PlusCircle } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { JobTable } from "@/components/dashboard/job-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { loadJobs } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "My Jobs · HireLoop",
}

export default async function RecruiterJobsPage() {
  const section = await loadJobs({ scope: "mine" })
  const jobs = section.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Recruiting"
        title="My job postings"
        description="Edit listings, review applicants, and keep every role up to date."
        actions={
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            Post a job
          </Link>
        }
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.failure && jobs.length === 0 ? (
        <ErrorState failure={section.failure} />
      ) : jobs.length === 0 && section.ok ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first listing and start receiving applications."
          action={
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              Post a job
            </Link>
          }
        />
      ) : (
        <JobTable jobs={jobs} variant="recruiter" />
      )}
    </div>
  )
}
