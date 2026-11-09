import type { Metadata } from "next"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { DistributionChart } from "@/components/dashboard/charts/distribution-chart"
import { TrendChart } from "@/components/dashboard/charts/trend-chart"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import {
  loadAnalytics,
  loadApplications,
  loadJobs,
  loadUsers,
} from "@/lib/api/dashboard"
import type { ApiFailure } from "@/lib/api/types"
import {
  getApplicationTrend,
  getJobPostingTrend,
  getJobStatusDistribution,
  getRoleDistribution,
  getUserRegistrationTrend,
} from "@/lib/dashboard/stats"

export const metadata: Metadata = {
  title: "Analytics · HireLoop",
}

export default async function AdminAnalyticsPage() {
  const [analyticsSection, usersSection, jobsSection, applicationsSection] =
    await Promise.all([
      loadAnalytics(),
      loadUsers(),
      loadJobs({ scope: "all" }),
      loadApplications({ scope: "all" }),
    ])

  const analytics = analyticsSection.data
  const users = usersSection.data ?? []
  const jobs = jobsSection.data ?? []
  const applications = applicationsSection.data ?? []

  const userTrend =
    analytics?.userRegistrationTrend ??
    (usersSection.ok ? getUserRegistrationTrend(users) : null)
  const jobTrend =
    analytics?.jobPostingTrend ??
    (jobsSection.ok ? getJobPostingTrend(jobs) : null)
  const applicationTrend =
    analytics?.applicationActivity ??
    (applicationsSection.ok ? getApplicationTrend(applications) : null)
  const roleDistribution =
    analytics?.roleDistribution ??
    (usersSection.ok ? getRoleDistribution(users) : null)
  const jobDistribution =
    analytics?.jobStatusDistribution ??
    (jobsSection.ok
      ? getJobStatusDistribution(jobs).map(({ name, value }) => ({
          name,
          value,
        }))
      : null)

  const failures = [
    analyticsSection.failure,
    usersSection.failure,
    jobsSection.failure,
    applicationsSection.failure,
  ].filter((failure) => failure !== null)

  const fallbackFailure: ApiFailure = analyticsSection.failure ??
    usersSection.failure ??
    jobsSection.failure ??
    applicationsSection.failure ?? {
      key: "analytics",
      endpoint: "/admin/analytics",
      requiredEndpoint: "/admin/analytics",
      kind: "network",
      message: "No analytics data could be loaded.",
      status: null,
      unavailable: false,
    }

  const hasAnyData = usersSection.ok || jobsSection.ok || applicationsSection.ok

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="Platform analytics"
        description="Growth, activity, and marketplace health. Charts fall back to live account and job data when the analytics endpoint is unavailable."
      />

      {failures.length > 0 ? <ApiNotice failures={failures} /> : null}

      {!hasAnyData ? <ErrorState failure={fallbackFailure} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="User registrations"
          description="New accounts over the last six months."
        >
          {userTrend ? (
            <TrendChart
              data={userTrend}
              label="Registrations"
              color="#818cf8"
            />
          ) : (
            <ErrorState
              failure={usersSection.failure ?? fallbackFailure}
              compact
            />
          )}
        </SectionCard>

        <SectionCard
          title="Job postings"
          description="Roles created over the last six months."
        >
          {jobTrend ? (
            <TrendChart data={jobTrend} label="Job posts" color="#38bdf8" />
          ) : (
            <ErrorState
              failure={jobsSection.failure ?? fallbackFailure}
              compact
            />
          )}
        </SectionCard>

        <SectionCard
          title="Application activity"
          description="Applications submitted over the last six months."
        >
          {applicationTrend ? (
            <TrendChart
              data={applicationTrend}
              label="Applications"
              color="#a78bfa"
            />
          ) : (
            <ErrorState
              failure={applicationsSection.failure ?? fallbackFailure}
              compact
            />
          )}
        </SectionCard>

        <SectionCard
          title="Account mix"
          description="Job seekers, recruiters, and administrators."
        >
          {roleDistribution ? (
            <DistributionChart
              data={roleDistribution}
              label="Accounts"
              variant="donut"
            />
          ) : (
            <ErrorState
              failure={usersSection.failure ?? fallbackFailure}
              compact
            />
          )}
        </SectionCard>

        <SectionCard
          title="Job status mix"
          description="Active, pending, paused, and closed roles."
          className="xl:col-span-2"
        >
          {jobDistribution ? (
            <DistributionChart
              data={jobDistribution}
              label="Jobs"
              variant="bar"
              height={240}
            />
          ) : (
            <ErrorState
              failure={jobsSection.failure ?? fallbackFailure}
              compact
            />
          )}
        </SectionCard>
      </div>

      {analyticsSection.failure ? (
        <p className="text-center text-[10px] leading-relaxed text-white/25">
          <code className="font-mono">GET /admin/analytics</code> is not
          available yet. Charts above are derived only from endpoints that
          responded successfully; no values are fabricated.
        </p>
      ) : null}
    </div>
  )
}
