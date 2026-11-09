export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "interview",
  "hired",
  "rejected",
  "withdrawn",
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export type Application = {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  companyLogo: string | null
  seekerId: string
  seekerName: string
  seekerEmail: string | null
  seekerAvatar: string | null
  seekerHeadline: string | null
  seekerSkills: string[]
  seekerExperienceYears: number | null
  status: ApplicationStatus
  resumeUrl: string | null
  coverLetter: string | null
  appliedAt: string | null
  updatedAt: string | null
}

export type ApplicationStats = {
  total: number
  pending: number
  reviewed: number
  shortlisted: number
  interview: number
  hired: number
  rejected: number
  withdrawn: number
}

export type SavedJob = {
  id: string
  job: import("./job").Job
  savedAt: string | null
}
