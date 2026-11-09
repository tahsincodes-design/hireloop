import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  Flag,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { DistributionChart } from "@/components/dashboard/charts/distribution-chart"
import { TrendChart } from "@/components/dashboard/charts/trend-chart"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SectionCard } from "@/components/dashboard/section-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/status-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import type { AdminOverview } from "@/lib/api/dashboard"
import {
  getApplicationStatusDistribution,
  getJobPostingTrend,
  getJobStats,
  getJobStatusDistribution,
  getRoleDistribution,
  getUserRegistrationTrend,
  getUserStats,
} from "@/lib/dashboard/stats"
import { formatDate, getGreeting, titleCase } from "@/lib/format"
import type { AuthUser } from "@/types/user"

export function AdminOverviewView({
  user,
  overview,
}: {
  user: AuthUser
  overview: AdminOverview
}) {
  const users = overview.users.data ?? []
  const jobs = overview.jobs.data ?? []
  const applications = overview.applications.data ?? []
  const reports = overview.reports.data ?? []
  const userStats = getUserStats(users)
  const jobStats = getJobStats(jobs)
  const openReports = reports.filter(
    (report) => report.status === "open" || report.status === "reviewing"
  ).length

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administrator workspace"
        title={`${getGreeting()}, ${user.name.split(" ")[0]}.`}
        description="Platform health, account management, and moderation at a glance."
        actions={
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <Users className="size-4" aria-hidden="true" />
            Manage users
          </Link>
        }
      />

      <ApiNotice failures={overview.failures} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total users"
          value={overview.users.ok ? userStats.total : null}
          hint={`${userStats.active} active accounts`}
          icon={Users}
          tone="indigo"
          unavailable={!overview.users.ok}
        />
        <StatCard
          label="Job seekers"
          value={overview.users.ok ? userStats.seeker : null}
          hint="Candidate accounts"
          icon={UserRound}
          tone="sky"
          unavailable={!overview.users.ok}
        />
        <StatCard
          label="Recruiters"
          value={overview.users.ok ? userStats.recruiter : null}
          hint={`${userStats.admin} administrators`}
          icon={ShieldCheck}
          tone="violet"
          unavailable={!overview.users.ok}
        />
        <StatCard
          label="Live jobs"
          value={overview.jobs.ok ? jobStats.active : null}
          hint={`${jobStats.total} total postings`}
          icon={Briefcase}
          tone="emerald"
          unavailable={!overview.jobs.ok}
        />
        <StatCard
          label="Open reports"
          value={overview.reports.ok ? openReports : null}
          hint="Awaiting moderation"
          icon={Flag}
          tone="amber"
          unavailable={!overview.reports.ok}
        />
      </div>

      <QuickActions role="admin" />

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="User growth"
          description="New registrations over the last six months."
          className="xl:col-span-2"
        >
          {overview.users.failure ? (
            <ErrorState failure={overview.users.failure} />
          ) : (
            <TrendChart
              data={getUserRegistrationTrend(users)}
              label="Registrations"
              color="#818cf8"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Account mix"
          description="Distribution of roles across HireLoop."
        >
          {overview.users.failure ? (
            <ErrorState failure={overview.users.failure} compact />
          ) : (
            <DistributionChart
              data={getRoleDistribution(users)}
              label="Accounts"
              variant="donut"
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Newest accounts"
          description="The most recent people to join the platform."
          action={
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              User management
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          }
        >
          {overview.users.failure ? (
            <ErrorState failure={overview.users.failure} compact />
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users returned"
              description="The users endpoint responded successfully with no accounts."
              compact
            />
          ) : (
            <ul className="divide-y divide-white/6">
              {[...users]
                .sort((a, b) => {
                  const aTime = a.createdAt
                    ? new Date(a.createdAt).getTime()
                    : 0
                  const bTime = b.createdAt
                    ? new Date(b.createdAt).getTime()
                    : 0
                  return bTime - aTime
                })
                .slice(0, 6)
                .map((account) => (
                  <li
                    key={account.id}
                    className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0"
                  >
                    <UserAvatar name={account.name} image={account.image} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">
                        {account.name}
                      </p>
                      <p className="truncate text-[11px] text-white/35">
                        {account.email} · {formatDate(account.createdAt)}
                      </p>
                    </div>
                    <RoleBadge role={account.role} />
                    <UserStatusBadge
                      status={account.status}
                      className="hidden sm:inline-flex"
                    />
                  </li>
                ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Job catalogue"
          description="Status of every role on the platform."
        >
          {overview.jobs.failure ? (
            <ErrorState failure={overview.jobs.failure} compact />
          ) : (
            <DistributionChart
              data={getJobStatusDistribution(jobs)}
              label="Jobs"
              variant="bar"
              height={210}
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Job posting trend"
          description="Roles created over the last six months."
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
          title="Application health"
          description="How applications are progressing platform-wide."
        >
          {overview.applications.failure ? (
            <ErrorState failure={overview.applications.failure} compact />
          ) : (
            <DistributionChart
              data={getApplicationStatusDistribution(applications)}
              label="Applications"
              variant="bar"
              height={210}
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Moderation queue"
        description="Reports that need an administrator's attention."
        action={
          <Link
            href="/dashboard/admin/reports"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
          >
            Open reports
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        }
      >
        {overview.reports.failure ? (
          <ErrorState failure={overview.reports.failure} compact />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="Moderation queue is clear"
            description="Flagged content will appear here for review."
            compact
          />
        ) : (
          <ul className="divide-y divide-white/6">
            {reports.slice(0, 5).map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white">
                    {report.targetName}
                  </p>
                  <p className="truncate text-[11px] text-white/35">
                    {report.reason} · {titleCase(report.targetType)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/50">
                  {titleCase(report.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
