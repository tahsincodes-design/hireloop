export const INTERVIEW_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
] as const
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number]

export type InterviewType = "video" | "phone" | "onsite"

export type Interview = {
  id: string
  applicationId: string | null
  jobId: string | null
  jobTitle: string
  companyName: string
  companyLogo: string | null
  candidateId: string | null
  candidateName: string
  candidateAvatar: string | null
  recruiterId: string | null
  recruiterName: string | null
  scheduledAt: string | null
  durationMinutes: number | null
  type: InterviewType
  status: InterviewStatus
  meetingLink: string | null
  location: string | null
  notes: string | null
  createdAt: string | null
}

export type InterviewInput = {
  applicationId?: string
  jobId?: string
  candidateId?: string
  scheduledAt: string
  durationMinutes?: number
  type: InterviewType
  meetingLink?: string
  location?: string
  notes?: string
}
