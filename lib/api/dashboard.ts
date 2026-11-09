import { API_BASE_URL } from "@/lib/api/config"
import { endpoints } from "@/lib/api/endpoints"
import {
  asNumber,
  asString,
  isRecord,
  normalizeApplication,
  normalizeCompany,
  normalizeInterview,
  normalizeJob,
  normalizeNotification,
  normalizeProfile,
  normalizeReport,
  normalizeSavedJob,
  normalizeUser,
  unwrapList,
  unwrapObject,
} from "@/lib/api/normalize"
import { serverApi } from "@/lib/api/server"
import {
  ApiError,
  toApiFailure,
  type ApiFailure,
  type QueryParams,
} from "@/lib/api/types"
import type { Application, SavedJob } from "@/types/application"
import type { Interview } from "@/types/interview"
import type { Job } from "@/types/job"
import type { AppNotification } from "@/types/notification"
import type { Report } from "@/types/report"
import type { Company, PlatformUser, Profile } from "@/types/user"

export type ApiSection<T> = {
  data: T | null
  failure: ApiFailure | null
  endpoint: string
  ok: boolean
}

export type SeriesPoint = { month: string; value: number }
export type DistributionPoint = { name: string; value: number }

export type AdminAnalytics = {
  userRegistrationTrend: SeriesPoint[] | null
  jobPostingTrend: SeriesPoint[] | null
  applicationActivity: SeriesPoint[] | null
  roleDistribution: DistributionPoint[] | null
  jobStatusDistribution: DistributionPoint[] | null
}

function displayEndpoint(path: string, query?: QueryParams) {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

async function section<T>(
  key: string,
  path: string,
  options: {
    query?: QueryParams
    request: () => Promise<unknown>
    normalize: (payload: unknown) => T | null
  }
): Promise<ApiSection<T>> {
  const endpoint = displayEndpoint(path, options.query)

  try {
    const payload = await options.request()
    return {
      data: options.normalize(payload),
      failure: null,
      endpoint,
      ok: true,
    }
  } catch (error) {
    const normalized =
      error instanceof ApiError
        ? error
        : new ApiError("The API response could not be read.", {
            kind: "invalid_response",
            endpoint,
            cause: error,
          })

    return {
      data: null,
      failure: toApiFailure(key, endpoint, normalized),
      endpoint,
      ok: false,
    }
  }
}

function listNormalizer<T>(normalize: (raw: unknown) => T | null) {
  return (payload: unknown): T[] =>
    unwrapList(payload)
      .map((item) => normalize(item))
      .filter((item): item is T => item !== null)
}

function collectFailures(
  sections: Record<string, ApiSection<unknown>>
): ApiFailure[] {
  return Object.values(sections)
    .map((sectionValue) => sectionValue.failure)
    .filter((failure): failure is ApiFailure => failure !== null)
}

export type SeekerOverview = {
  applications: ApiSection<Application[]>
  savedJobs: ApiSection<SavedJob[]>
  interviews: ApiSection<Interview[]>
  recommendedJobs: ApiSection<Job[]>
  profile: ApiSection<Profile>
  failures: ApiFailure[]
}

export async function loadSeekerOverview(): Promise<SeekerOverview> {
  const applicationsQuery = { scope: "mine" }
  const interviewsQuery = { upcoming: "true" }

  const [applications, savedJobs, interviews, recommendedJobs, profile] =
    await Promise.all([
      section("applications", endpoints.applications, {
        query: applicationsQuery,
        request: () =>
          serverApi.get(endpoints.applications, { query: applicationsQuery }),
        normalize: listNormalizer(normalizeApplication),
      }),
      section("saved-jobs", endpoints.savedJobs, {
        request: () => serverApi.get(endpoints.savedJobs),
        normalize: listNormalizer(normalizeSavedJob),
      }),
      section("interviews", endpoints.interviews, {
        query: interviewsQuery,
        request: () =>
          serverApi.get(endpoints.interviews, { query: interviewsQuery }),
        normalize: listNormalizer(normalizeInterview),
      }),
      section("recommended-jobs", endpoints.recommendedJobs, {
        request: () => serverApi.get(endpoints.recommendedJobs),
        normalize: listNormalizer(normalizeJob),
      }),
      section("profile", endpoints.profile, {
        request: () => serverApi.get(endpoints.profile),
        normalize: normalizeProfile,
      }),
    ])

  const sections = {
    applications,
    savedJobs,
    interviews,
    recommendedJobs,
    profile,
  }

  return { ...sections, failures: collectFailures(sections) }
}

export type RecruiterOverview = {
  jobs: ApiSection<Job[]>
  applications: ApiSection<Application[]>
  interviews: ApiSection<Interview[]>
  candidates: ApiSection<PlatformUser[]>
  company: ApiSection<Company>
  failures: ApiFailure[]
}

export async function loadRecruiterOverview(): Promise<RecruiterOverview> {
  const jobsQuery = { scope: "mine" }
  const applicationsQuery = { scope: "recruiter" }
  const interviewsQuery = { upcoming: "true", scope: "recruiter" }
  const candidatesQuery = { limit: 6 }

  const [jobs, applications, interviews, candidates, company] =
    await Promise.all([
      section("jobs", endpoints.jobs, {
        query: jobsQuery,
        request: () => serverApi.get(endpoints.jobs, { query: jobsQuery }),
        normalize: listNormalizer(normalizeJob),
      }),
      section("applications", endpoints.applications, {
        query: applicationsQuery,
        request: () =>
          serverApi.get(endpoints.applications, { query: applicationsQuery }),
        normalize: listNormalizer(normalizeApplication),
      }),
      section("interviews", endpoints.interviews, {
        query: interviewsQuery,
        request: () =>
          serverApi.get(endpoints.interviews, { query: interviewsQuery }),
        normalize: listNormalizer(normalizeInterview),
      }),
      section("candidates", endpoints.candidates, {
        query: candidatesQuery,
        request: () =>
          serverApi.get(endpoints.candidates, { query: candidatesQuery }),
        normalize: listNormalizer(normalizeUser),
      }),
      section("company", endpoints.company, {
        request: () => serverApi.get(endpoints.company),
        normalize: normalizeCompany,
      }),
    ])

  const sections = { jobs, applications, interviews, candidates, company }

  return { ...sections, failures: collectFailures(sections) }
}

export type AdminOverview = {
  users: ApiSection<PlatformUser[]>
  jobs: ApiSection<Job[]>
  applications: ApiSection<Application[]>
  analytics: ApiSection<AdminAnalytics>
  reports: ApiSection<Report[]>
  failures: ApiFailure[]
}

function normalizeSeries(value: unknown): SeriesPoint[] | null {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "number") return null
        if (!isRecord(item)) return null
        const label =
          asString(item.month ?? item.label ?? item.name ?? item.date) ?? ""
        const numeric = asNumber(
          item.value ?? item.count ?? item.total ?? item.applications
        )
        if (numeric === null) return null
        return { month: label, value: numeric }
      })
      .filter((item): item is SeriesPoint => item !== null)
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, raw]) => {
        const numeric = asNumber(raw)
        return numeric === null ? null : { month: key, value: numeric }
      })
      .filter((item): item is SeriesPoint => item !== null)
  }

  return null
}

function normalizeDistribution(value: unknown): DistributionPoint[] | null {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!isRecord(item)) return null
        const name =
          asString(item.name ?? item.label ?? item.role ?? item.status) ?? ""
        const numeric = asNumber(item.value ?? item.count ?? item.total)
        if (!name || numeric === null) return null
        return { name, value: numeric }
      })
      .filter((item): item is DistributionPoint => item !== null)
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, raw]) => {
        const numeric = asNumber(raw)
        return numeric === null ? null : { name: key, value: numeric }
      })
      .filter((item): item is DistributionPoint => item !== null)
  }

  return null
}

function normalizeAnalytics(payload: unknown): AdminAnalytics | null {
  const raw = unwrapObject(payload)
  if (!raw) return null

  return {
    userRegistrationTrend: normalizeSeries(
      raw.userRegistrationTrend ?? raw.userTrend ?? raw.registrations
    ),
    jobPostingTrend: normalizeSeries(
      raw.jobPostingTrend ?? raw.jobTrend ?? raw.jobs
    ),
    applicationActivity: normalizeSeries(
      raw.applicationActivity ?? raw.applicationTrend ?? raw.applications
    ),
    roleDistribution: normalizeDistribution(
      raw.roleDistribution ?? raw.roles ?? raw.userRoles
    ),
    jobStatusDistribution: normalizeDistribution(
      raw.jobStatusDistribution ?? raw.jobStatuses
    ),
  }
}

export async function loadAdminOverview(): Promise<AdminOverview> {
  const jobsQuery = { scope: "all" }
  const applicationsQuery = { scope: "all" }

  const [users, jobs, applications, analytics, reports] = await Promise.all([
    section("users", endpoints.users, {
      request: () => serverApi.get(endpoints.users),
      normalize: listNormalizer(normalizeUser),
    }),
    section("jobs", endpoints.jobs, {
      query: jobsQuery,
      request: () => serverApi.get(endpoints.jobs, { query: jobsQuery }),
      normalize: listNormalizer(normalizeJob),
    }),
    section("applications", endpoints.applications, {
      query: applicationsQuery,
      request: () =>
        serverApi.get(endpoints.applications, { query: applicationsQuery }),
      normalize: listNormalizer(normalizeApplication),
    }),
    section("analytics", endpoints.admin.analytics, {
      request: () => serverApi.get(endpoints.admin.analytics),
      normalize: normalizeAnalytics,
    }),
    section("reports", endpoints.admin.reports, {
      request: () => serverApi.get(endpoints.admin.reports),
      normalize: listNormalizer(normalizeReport),
    }),
  ])

  const sections = { users, jobs, applications, analytics, reports }

  return { ...sections, failures: collectFailures(sections) }
}

export function loadJobs(
  options: {
    scope?: "mine" | "all"
    search?: string
    status?: string
    page?: number
    limit?: number
  } = {}
): Promise<ApiSection<Job[]>> {
  const query: QueryParams = {
    scope: options.scope,
    search: options.search,
    status: options.status,
    page: options.page,
    limit: options.limit,
  }

  return section("jobs", endpoints.jobs, {
    query,
    request: () => serverApi.get(endpoints.jobs, { query }),
    normalize: listNormalizer(normalizeJob),
  })
}

export function loadApplications(
  options: {
    scope?: "mine" | "recruiter" | "all"
    status?: string
    search?: string
    page?: number
    limit?: number
  } = {}
): Promise<ApiSection<Application[]>> {
  const query: QueryParams = {
    scope: options.scope,
    status: options.status,
    search: options.search,
    page: options.page,
    limit: options.limit,
  }

  return section("applications", endpoints.applications, {
    query,
    request: () => serverApi.get(endpoints.applications, { query }),
    normalize: listNormalizer(normalizeApplication),
  })
}

export function loadSavedJobs(): Promise<ApiSection<SavedJob[]>> {
  return section("saved-jobs", endpoints.savedJobs, {
    request: () => serverApi.get(endpoints.savedJobs),
    normalize: listNormalizer(normalizeSavedJob),
  })
}

export function loadInterviews(
  options: {
    scope?: "mine" | "recruiter" | "all"
    upcoming?: boolean
  } = {}
): Promise<ApiSection<Interview[]>> {
  const query: QueryParams = {
    scope: options.scope,
    upcoming: options.upcoming ? "true" : undefined,
  }

  return section("interviews", endpoints.interviews, {
    query,
    request: () => serverApi.get(endpoints.interviews, { query }),
    normalize: listNormalizer(normalizeInterview),
  })
}

export function loadCandidates(
  options: {
    search?: string
    limit?: number
  } = {}
): Promise<ApiSection<PlatformUser[]>> {
  const query: QueryParams = {
    search: options.search,
    limit: options.limit,
  }

  return section("candidates", endpoints.candidates, {
    query,
    request: () => serverApi.get(endpoints.candidates, { query }),
    normalize: listNormalizer(normalizeUser),
  })
}

export function loadUsers(): Promise<ApiSection<PlatformUser[]>> {
  return section("users", endpoints.users, {
    request: () => serverApi.get(endpoints.users),
    normalize: listNormalizer(normalizeUser),
  })
}

export function loadProfile(): Promise<ApiSection<Profile>> {
  return section("profile", endpoints.profile, {
    request: () => serverApi.get(endpoints.profile),
    normalize: normalizeProfile,
  })
}

export function loadCompany(): Promise<ApiSection<Company>> {
  return section("company", endpoints.company, {
    request: () => serverApi.get(endpoints.company),
    normalize: normalizeCompany,
  })
}

export function loadNotifications(): Promise<ApiSection<AppNotification[]>> {
  return section("notifications", endpoints.notifications, {
    request: () => serverApi.get(endpoints.notifications),
    normalize: listNormalizer(normalizeNotification),
  })
}

export function loadReports(): Promise<ApiSection<Report[]>> {
  return section("reports", endpoints.admin.reports, {
    request: () => serverApi.get(endpoints.admin.reports),
    normalize: listNormalizer(normalizeReport),
  })
}

export function loadAnalytics(): Promise<ApiSection<AdminAnalytics>> {
  return section("analytics", endpoints.admin.analytics, {
    request: () => serverApi.get(endpoints.admin.analytics),
    normalize: normalizeAnalytics,
  })
}

export async function checkApiConnection(): Promise<{
  ok: boolean
  status: number | null
  message: string
  baseUrl: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    })

    return {
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? "The Express API is reachable."
        : `The Express API responded with ${response.status}.`,
      baseUrl: API_BASE_URL,
    }
  } catch {
    return {
      ok: false,
      status: null,
      message:
        "The Express API could not be reached. Confirm it is running and the base URL is correct.",
      baseUrl: API_BASE_URL,
    }
  }
}
