/**
 * The Express API is the source of truth. These paths are the frontend
 * contract; endpoints that are not implemented yet are documented in
 * docs/BACKEND_API_CONTRACT.md.
 */
export const endpoints = {
  users: "/users",
  user: (id: string) => `/users/${encodeURIComponent(id)}`,
  candidates: "/candidates",

  jobs: "/jobs",
  job: (id: string) => `/jobs/${encodeURIComponent(id)}`,
  recommendedJobs: "/jobs/recommended",

  applications: "/applications",
  application: (id: string) => `/applications/${encodeURIComponent(id)}`,

  savedJobs: "/saved-jobs",
  savedJob: (jobId: string) => `/saved-jobs/${encodeURIComponent(jobId)}`,

  interviews: "/interviews",
  interview: (id: string) => `/interviews/${encodeURIComponent(id)}`,

  notifications: "/notifications",
  notificationsReadAll: "/notifications/read-all",
  notificationRead: (id: string) =>
    `/notifications/${encodeURIComponent(id)}/read`,

  profile: "/profiles/me",
  resume: "/profiles/me/resume",
  company: "/companies/me",

  admin: {
    stats: "/admin/stats",
    analytics: "/admin/analytics",
    reports: "/admin/reports",
    report: (id: string) => `/admin/reports/${encodeURIComponent(id)}`,
  },
} as const
