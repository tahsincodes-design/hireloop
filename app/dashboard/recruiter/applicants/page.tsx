import type { Metadata } from "next"
import Link from "next/link"
import { Users } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { InterviewScheduleDialog } from "@/components/dashboard/interview-schedule-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { ApplicationPipeline } from "@/components/dashboard/pipeline-board"
import { SectionCard } from "@/components/dashboard/section-card"
import { loadApplications } from "@/lib/api/dashboard"
import { APPLICATION_STATUS_TONES } from "@/lib/dashboard/status"
import {
  firstParam,
  type DashboardSearchParams,
} from "@/lib/dashboard/search-params"
import { APPLICATION_STATUSES } from "@/types/application"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Applicants · HireLoop",
}

export default async function RecruiterApplicantsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const params = await searchParams
  const statusParam = firstParam(params.status)
  const jobId = firstParam(params.jobId)
  const status = APPLICATION_STATUSES.find((item) => item === statusParam)

  const section = await loadApplications({ scope: "recruiter", status })
  const allApplications = section.data ?? []
  const applications = jobId
    ? allApplications.filter((application) => application.jobId === jobId)
    : allApplications

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Recruiting"
        title="Applicant pipeline"
        description="Review new applicants, shortlist strong fits, and move candidates through each hiring stage."
        actions={
          <InterviewScheduleDialog applications={applications} jobId={jobId} />
        }
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <nav
        aria-label="Filter applicants by status"
        className="flex flex-wrap gap-1.5"
      >
        <Link
          href={
            jobId
              ? `/dashboard/recruiter/applicants?jobId=${jobId}`
              : "/dashboard/recruiter/applicants"
          }
          className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
            !status
              ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
              : "border-white/8 bg-white/[0.02] text-white/45 hover:text-white/75"
          )}
        >
          All stages
        </Link>
        {APPLICATION_STATUSES.map((item) => (
          <Link
            key={item}
            href={`/dashboard/recruiter/applicants?status=${item}${
              jobId ? `&jobId=${jobId}` : ""
            }`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
              status === item
                ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
                : "border-white/8 bg-white/[0.02] text-white/45 hover:text-white/75"
            )}
          >
            {APPLICATION_STATUS_TONES[item].label}
          </Link>
        ))}
      </nav>

      {jobId ? (
        <p className="text-[11px] text-white/35">
          Showing applicants for one job.{" "}
          <Link
            href="/dashboard/recruiter/applicants"
            className="text-indigo-300 hover:text-indigo-200"
          >
            Clear filter
          </Link>
        </p>
      ) : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants found"
          description={
            status
              ? "No candidates are currently at this stage."
              : "Applications will appear here as soon as candidates apply."
          }
        />
      ) : (
        <SectionCard
          title="Hiring pipeline"
          description="Update stages with the menu on each candidate card."
          contentClassName="p-3 sm:p-4"
        >
          <ApplicationPipeline applications={applications} />
        </SectionCard>
      )}
    </div>
  )
}
