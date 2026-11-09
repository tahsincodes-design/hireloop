import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  PlusCircle,
  Users,
  UserSearch,
} from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { DistributionChart } from "@/components/dashboard/charts/distribution-chart"
import { TrendChart } from "@/components/dashboard/charts/trend-chart"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { InterviewCard } from "@/components/dashboard/interview-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { ApplicationPipeline } from "@/components/dashboard/pipeline-board"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SectionCard } from "@/components/dashboard/section-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { JobStatusBadge } from "@/components/dashboard/status-badge"
import type { RecruiterOverview } from "@/lib/api/dashboard"
import {
  getApplicationStats,
  getApplicationStatusDistribution,
  getApplicationTrend,
  getJobPostingTrend,
  getJobStats,
  getUpcomingInterviews,
} from "@/lib/dashboard/stats"
import { formatDate, getGreeting, titleCase } from "@/lib/format"
import type { AuthUser } from "@/types/user"

export function RecruiterOverviewView({
  user,
  overview,
}: {
  user: AuthUser
  overview: RecruiterOverview
}) {
  const jobs = overview.jobs.data ?? []
  const applications = overview.applications.data ?? []
  const interviews = overview.interviews.data ?? []
  const candidates = overview.candidates.data ?? []
  const company = overview.company.data
  const jobStats = getJobStats(jobs)
  const applicationStats = getApplicationStats(applications)
  const upcoming = getUpcomingInterviews(interviews)
  const newApplicants = applicationStats.pending

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Recruiter workspace"
        title={`${getGreeting()}, ${user.name.split(" ")[0]}.`}
        description={`Here is what is moving across ${
          company?.name ? `${company.name}'s` : "your"
        } hiring pipeline.`}
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

      <ApiNotice failures={overview.failures} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Open jobs"
          value={overview.jobs.ok ? jobStats.active : null}
          hint={`${jobStats.total} total postings`}
          icon={Briefcase}
          tone="violet"
          unavailable={!overview.jobs.ok}
        />
        <StatCard
          label="Applicants"
          value={overview.applications.ok ? applicationStats.total : null}
          hint={`${newApplicants} awaiting review`}
          icon={Users}
          tone="indigo"
          unavailable={!overview.applications.ok}
        />
        <StatCard
          label="Shortlisted"
          value={overview.applications.ok ? applicationStats.shortlisted : null}
          hint="Ready for interviews"
          icon={UserSearch}
          tone="sky"
          unavailable={!overview.applications.ok}
        />
        <StatCard
          label="Interviews"
          value={overview.interviews.ok ? upcoming.length : null}
          hint="Scheduled ahead"
          icon={CalendarDays}
          tone="emerald"
          unavailable={!overview.interviews.ok}
        />
        <StatCard
          label="Hired"
          value={overview.applications.ok ? applicationStats.hired : null}
          hint="Successful placements"
          icon={Users}
          tone="amber"
          unavailable={!overview.applications.ok}
        />
      </div>

      <QuickActions role="recruiter" />

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Applicant activity"
          description="Applications received over the last six months."
          className="xl:col-span-2"
        >
          {overview.applications.failure ? (
            <ErrorState failure={overview.applications.failure} />
          ) : (
            <TrendChart
              data={getApplicationTrend(applications)}
              label="Applications"
              color="#a78bfa"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Hiring stages"
          description="Current distribution across your pipeline."
        >
          {overview.applications.failure ? (
            <ErrorState failure={overview.applications.failure} compact />
          ) : (
            <DistributionChart
              data={getApplicationStatusDistribution(applications)}
              label="Applicants"
              variant="donut"
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Pipeline snapshot"
        description="Move candidates between stages directly from the board."
        action={
          <Link
            href="/dashboard/recruiter/applicants"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
          >
            Open pipeline
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        }
        contentClassName="p-3 sm:p-4"
      >
        {overview.applications.failure ? (
          <ErrorState failure={overview.applications.failure} compact />
        ) : (
          <ApplicationPipeline applications={applications} limitPerColumn={2} />
        )}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Your job postings"
          description="Status at a glance across your open roles."
          action={
            <Link
              href="/dashboard/recruiter/jobs"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              Manage jobs
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          }
        >
          {overview.jobs.failure ? (
            <ErrorState failure={overview.jobs.failure} compact />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs posted"
              description="Publish your first role to start receiving applications."
              compact
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
            <ul className="divide-y divide-white/6">
              {jobs.slice(0, 5).map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white">
                      {job.title}
                    </p>
                    <p className="truncate text-[11px] text-white/35">
                      {job.location} · {job.applicantsCount ?? 0} applicants ·{" "}
                      {formatDate(job.postedAt)}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming interviews"
          description="Confirm details before candidates arrive."
          action={
            <Link
              href="/dashboard/recruiter/interviews"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              All interviews
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          }
        >
          {overview.interviews.failure ? (
            <ErrorState failure={overview.interviews.failure} compact />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No interviews scheduled"
              description="Schedule an interview once a candidate is shortlisted."
              compact
            />
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 3).map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  perspective="recruiter"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Job posting trend"
          description="Roles created over the last six months."
          className="xl:col-span-2"
        >
          {overview.jobs.failure ? (
            <ErrorState failure={overview.jobs.failure} compact />
          ) : (
            <TrendChart
              data={getJobPostingTrend(jobs)}
              label="Job posts"
              color="#38bdf8"
              height={200}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Company profile"
          description="Shown on every listing you publish."
        >
          {overview.company.failure ? (
            <ErrorState failure={overview.company.failure} compact />
          ) : company ? (
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 text-violet-300">
                  <Building2 className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white">
                    {company.name}
                  </p>
                  <p className="truncate text-[11px] text-white/35">
                    {company.industry ?? "Industry not set"}
                  </p>
                </div>
              </div>
              <p className="text-white/40">
                {company.location ?? "Location not set"} ·{" "}
                {company.size ?? "Size not set"}
              </p>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-indigo-300 hover:text-indigo-200"
                >
                  {company.website}
                </a>
              ) : null}
              <Link
                href="/dashboard/recruiter/company"
                className="inline-flex items-center gap-1 pt-1 text-indigo-300 hover:text-indigo-200"
              >
                Edit company
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="Company profile empty"
              description="Add your company details so candidates know who is hiring."
              compact
              action={
                <Link
                  href="/dashboard/recruiter/company"
                  className="text-[11px] text-indigo-300 hover:text-indigo-200"
                >
                  Create profile
                </Link>
              }
            />
          )}
        </SectionCard>
      </div>

      {overview.candidates.ok && candidates.length > 0 ? (
        <SectionCard
          title="Candidate pool"
          description={`${candidates.length} job seekers recently active on HireLoop.`}
          action={
            <Link
              href="/dashboard/recruiter/candidates"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              Browse candidates
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          }
        >
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {candidates.slice(0, 3).map((candidate) => (
              <li
                key={candidate.id}
                className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5"
              >
                <p className="truncate text-[12px] font-medium text-white">
                  {candidate.name}
                </p>
                <p className="truncate text-[10px] text-white/35">
                  {candidate.headline ?? titleCase(candidate.role)}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  )
}
