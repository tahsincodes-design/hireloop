import Link from "next/link"
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CalendarDays,
  FileText,
  Search,
  UserRound,
} from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { DistributionChart } from "@/components/dashboard/charts/distribution-chart"
import { TrendChart } from "@/components/dashboard/charts/trend-chart"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { InterviewCard } from "@/components/dashboard/interview-card"
import { JobCard } from "@/components/dashboard/job-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SectionCard } from "@/components/dashboard/section-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge"
import type { SeekerOverview } from "@/lib/api/dashboard"
import {
  getApplicationStats,
  getApplicationStatusDistribution,
  getApplicationTrend,
  getProfileCompletion,
  getUpcomingInterviews,
} from "@/lib/dashboard/stats"
import { formatDate, getGreeting, pluralize, truncate } from "@/lib/format"
import type { AuthUser } from "@/types/user"

export function SeekerOverviewView({
  user,
  overview,
}: {
  user: AuthUser
  overview: SeekerOverview
}) {
  const applications = overview.applications.data ?? []
  const savedJobs = overview.savedJobs.data ?? []
  const interviews = overview.interviews.data ?? []
  const recommendedJobs = overview.recommendedJobs.data ?? []
  const profile = overview.profile.data
  const applicationStats = getApplicationStats(applications)
  const upcoming = getUpcomingInterviews(interviews)
  const profileCompletion = getProfileCompletion(profile, user.image)
  const inProgress =
    applicationStats.pending +
    applicationStats.reviewed +
    applicationStats.shortlisted +
    applicationStats.interview

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Job seeker workspace"
        title={`${getGreeting()}, ${user.name.split(" ")[0]}.`}
        description="Your applications, interviews, and next best roles in one place."
        actions={
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <Search className="size-4" aria-hidden="true" />
            Find jobs
          </Link>
        }
      />

      <ApiNotice failures={overview.failures} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Applications"
          value={overview.applications.ok ? applicationStats.total : null}
          hint={`${formatDate(applications[0]?.appliedAt)} latest`}
          icon={FileText}
          tone="indigo"
          unavailable={!overview.applications.ok}
        />
        <StatCard
          label="In progress"
          value={overview.applications.ok ? inProgress : null}
          hint="Pending through interview"
          icon={Briefcase}
          tone="sky"
          unavailable={!overview.applications.ok}
        />
        <StatCard
          label="Upcoming interviews"
          value={overview.interviews.ok ? upcoming.length : null}
          hint={
            upcoming[0] ? formatDate(upcoming[0].scheduledAt) : "Nothing booked"
          }
          icon={CalendarDays}
          tone="violet"
          unavailable={!overview.interviews.ok}
        />
        <StatCard
          label="Saved jobs"
          value={overview.savedJobs.ok ? savedJobs.length : null}
          hint="Roles you bookmarked"
          icon={Bookmark}
          tone="emerald"
          unavailable={!overview.savedJobs.ok}
        />
        <StatCard
          label="Profile strength"
          value={
            overview.profile.ok ? `${profileCompletion.percentage}%` : null
          }
          hint={
            profileCompletion.missing[0]
              ? `Add ${profileCompletion.missing[0].toLowerCase()}`
              : "Profile complete"
          }
          icon={UserRound}
          tone="amber"
          unavailable={!overview.profile.ok}
        />
      </div>

      <QuickActions role="seeker" />

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Application activity"
          description="Submitted applications over the last six months."
          className="xl:col-span-2"
        >
          {overview.applications.failure ? (
            <ErrorState failure={overview.applications.failure} />
          ) : (
            <TrendChart
              data={getApplicationTrend(applications)}
              label="Applications"
              color="#818cf8"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Application status"
          description="Where every application currently stands."
        >
          {overview.applications.failure ? (
            <ErrorState failure={overview.applications.failure} compact />
          ) : (
            <DistributionChart
              data={getApplicationStatusDistribution(applications)}
              label="Applications"
              variant="donut"
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Recent applications"
          description="The latest roles you applied to."
          action={
            <Link
              href="/dashboard/seeker/applications"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              View all
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          }
        >
          {overview.applications.failure ? (
            <ErrorState failure={overview.applications.failure} compact />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Apply to a role and your progress will appear here."
              compact
              action={
                <Link
                  href="/dashboard/seeker/jobs"
                  className="text-[11px] text-indigo-300 hover:text-indigo-200"
                >
                  Browse open roles
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-white/6">
              {applications.slice(0, 5).map((application) => (
                <li
                  key={application.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white">
                      {application.jobTitle}
                    </p>
                    <p className="truncate text-[11px] text-white/35">
                      {application.companyName} ·{" "}
                      {formatDate(application.appliedAt)}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming interviews"
          description="Your next scheduled conversations."
          action={
            <Link
              href="/dashboard/seeker/interviews"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              View all
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          }
        >
          {overview.interviews.failure ? (
            <ErrorState failure={overview.interviews.failure} compact />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming interviews"
              description="When a recruiter schedules an interview, it will appear here."
              compact
            />
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 3).map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recommended for you"
        description="Roles matched from the job marketplace."
        action={
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
          >
            Search jobs
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        }
      >
        {overview.recommendedJobs.failure ? (
          <ErrorState failure={overview.recommendedJobs.failure} compact />
        ) : recommendedJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No recommendations yet"
            description="Complete your profile so HireLoop can match you with relevant roles."
            compact
            action={
              <Link
                href="/dashboard/seeker/profile"
                className="text-[11px] text-indigo-300 hover:text-indigo-200"
              >
                Improve profile
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recommendedJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </SectionCard>

      {profileCompletion.missing.length > 0 && overview.profile.ok ? (
        <p className="text-center text-[11px] text-white/25">
          {pluralize(profileCompletion.missing.length, "profile item")} still
          missing: {truncate(profileCompletion.missing.join(", "), 140)}
        </p>
      ) : null}
    </div>
  )
}
