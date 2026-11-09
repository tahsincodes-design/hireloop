export const JOB_STATUSES = [
  "draft",
  "pending",
  "active",
  "paused",
  "closed",
  "rejected",
  "suspended",
] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "temporary",
  "remote",
] as const
export type JobType = (typeof JOB_TYPES)[number]

export type Job = {
  id: string
  title: string
  companyId: string | null
  companyName: string
  companyLogo: string | null
  recruiterId: string | null
  location: string
  type: JobType | string
  category: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  description: string
  requirements: string[]
  status: JobStatus
  applicantsCount: number | null
  postedAt: string | null
  deadline: string | null
  createdAt: string | null
  updatedAt: string | null
  saved?: boolean
}

export type JobInput = {
  title: string
  location: string
  type: string
  category?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  description: string
  requirements?: string[]
  deadline?: string
}

export type JobStats = {
  total: number
  active: number
  paused: number
  closed: number
  pending: number
  totalApplicants: number
}
