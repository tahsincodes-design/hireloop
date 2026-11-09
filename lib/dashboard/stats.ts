import type {
  Application,
  ApplicationStats,
  SavedJob,
} from "@/types/application"
import type { Interview } from "@/types/interview"
import type { Job, JobStats } from "@/types/job"
import type { PlatformUser, Profile } from "@/types/user"

export function getApplicationStats(
  applications: Application[]
): ApplicationStats {
  return applications.reduce<ApplicationStats>(
    (stats, application) => {
      stats.total += 1
      stats[application.status] += 1
      return stats
    },
    {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
      withdrawn: 0,
    }
  )
}

export function getJobStats(jobs: Job[], totalApplicants?: number): JobStats {
  return jobs.reduce<JobStats>(
    (stats, job) => {
      stats.total += 1
      if (job.status === "active") stats.active += 1
      if (job.status === "paused") stats.paused += 1
      if (job.status === "closed") stats.closed += 1
      if (job.status === "pending") stats.pending += 1
      stats.totalApplicants += job.applicantsCount ?? 0
      return stats
    },
    {
      total: 0,
      active: 0,
      paused: 0,
      closed: 0,
      pending: 0,
      totalApplicants: totalApplicants ?? 0,
    }
  )
}

export function getUserStats(users: PlatformUser[]) {
  return users.reduce(
    (stats, user) => {
      stats.total += 1
      stats[user.role] += 1
      if (user.status === "active") stats.active += 1
      if (user.status === "suspended") stats.suspended += 1
      return stats
    },
    {
      total: 0,
      seeker: 0,
      recruiter: 0,
      admin: 0,
      active: 0,
      suspended: 0,
    }
  )
}

export function getUpcomingInterviews(interviews: Interview[]) {
  const now = Date.now()

  return interviews
    .filter((interview) => {
      if (
        interview.status !== "scheduled" &&
        interview.status !== "rescheduled"
      ) {
        return false
      }
      if (!interview.scheduledAt) return false
      const time = new Date(interview.scheduledAt).getTime()
      return Number.isFinite(time) && time >= now
    })
    .sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
      return aTime - bTime
    })
}

export const PROFILE_FIELDS = [
  "Profile photo",
  "Professional headline",
  "Skills",
  "Education",
  "Experience",
  "Resume / CV",
  "Location",
] as const

export function getProfileCompletion(
  profile: Profile | null,
  fallbackImage?: string | null
) {
  const completed: string[] = []
  const missing: string[] = []

  const checks: [string, boolean][] = [
    ["Profile photo", Boolean(profile?.avatarUrl || fallbackImage)],
    ["Professional headline", Boolean(profile?.headline)],
    ["Skills", Boolean(profile && profile.skills.length > 0)],
    ["Education", Boolean(profile && profile.education.length > 0)],
    ["Experience", Boolean(profile && profile.experience.length > 0)],
    ["Resume / CV", Boolean(profile?.resumeUrl)],
    ["Location", Boolean(profile?.location)],
  ]

  for (const [label, done] of checks) {
    if (done) completed.push(label)
    else missing.push(label)
  }

  const percentage = Math.round(
    (completed.length / PROFILE_FIELDS.length) * 100
  )

  return { percentage, completed, missing }
}

type TrendPoint = { month: string; value: number }

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
})

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function buildMonthBuckets(months: number) {
  const now = new Date()
  const buckets: { key: string; label: string; value: number }[] = []

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1)
    )
    buckets.push({
      key: monthKey(date),
      label: MONTH_FORMATTER.format(date),
      value: 0,
    })
  }

  return buckets
}

function countByMonth(
  values: (string | null | undefined)[],
  months = 6
): TrendPoint[] {
  const buckets = buildMonthBuckets(months)
  const index = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const value of values) {
    if (!value) continue
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) continue
    const bucket = index.get(monthKey(date))
    if (bucket) bucket.value += 1
  }

  return buckets.map(({ label, value }) => ({ month: label, value }))
}

export function getUserRegistrationTrend(users: PlatformUser[], months = 6) {
  return countByMonth(
    users.map((user) => user.createdAt),
    months
  )
}

export function getApplicationTrend(applications: Application[], months = 6) {
  return countByMonth(
    applications.map((application) => application.appliedAt),
    months
  )
}

export function getJobPostingTrend(jobs: Job[], months = 6) {
  return countByMonth(
    jobs.map((job) => job.postedAt ?? job.createdAt),
    months
  )
}

export function getStatusDistribution(
  values: string[],
  orderedKeys: { key: string; label: string; color: string }[]
) {
  return orderedKeys
    .map(({ key, label, color }) => ({
      name: label,
      key,
      value: values.filter((value) => value === key).length,
      color,
    }))
    .filter((entry) => entry.value > 0)
}

export function getRoleDistribution(users: PlatformUser[]) {
  return getStatusDistribution(
    users.map((user) => user.role),
    [
      { key: "seeker", label: "Job seekers", color: "#38bdf8" },
      { key: "recruiter", label: "Recruiters", color: "#a78bfa" },
      { key: "admin", label: "Admins", color: "#fbbf24" },
    ]
  )
}

export function getApplicationStatusDistribution(applications: Application[]) {
  return getStatusDistribution(
    applications.map((application) => application.status),
    [
      { key: "pending", label: "Pending", color: "#fbbf24" },
      { key: "reviewed", label: "Reviewed", color: "#38bdf8" },
      { key: "shortlisted", label: "Shortlisted", color: "#a78bfa" },
      { key: "interview", label: "Interview", color: "#818cf8" },
      { key: "hired", label: "Hired", color: "#34d399" },
      { key: "rejected", label: "Rejected", color: "#fb7185" },
      { key: "withdrawn", label: "Withdrawn", color: "#94a3b8" },
    ]
  )
}

export function getJobStatusDistribution(jobs: Job[]) {
  return getStatusDistribution(
    jobs.map((job) => job.status),
    [
      { key: "active", label: "Active", color: "#34d399" },
      { key: "pending", label: "Pending", color: "#fbbf24" },
      { key: "paused", label: "Paused", color: "#38bdf8" },
      { key: "closed", label: "Closed", color: "#94a3b8" },
      { key: "draft", label: "Draft", color: "#64748b" },
      { key: "rejected", label: "Rejected", color: "#fb7185" },
      { key: "suspended", label: "Suspended", color: "#f43f5e" },
    ]
  )
}

export function getSavedJobIds(savedJobs: SavedJob[]) {
  return new Set(savedJobs.map((saved) => saved.job.id))
}
