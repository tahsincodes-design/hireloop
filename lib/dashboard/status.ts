import type { ApplicationStatus } from "@/types/application"
import type { JobStatus } from "@/types/job"
import type { UserStatus } from "@/types/user"

type StatusTone = {
  label: string
  className: string
  dotClassName: string
}

export const APPLICATION_STATUS_TONES: Record<ApplicationStatus, StatusTone> = {
  pending: {
    label: "Pending",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dotClassName: "bg-amber-400",
  },
  reviewed: {
    label: "Reviewed",
    className: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    dotClassName: "bg-sky-400",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    dotClassName: "bg-violet-400",
  },
  interview: {
    label: "Interview",
    className: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    dotClassName: "bg-indigo-400",
  },
  hired: {
    label: "Hired",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    dotClassName: "bg-rose-400",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "border-white/10 bg-white/5 text-white/50",
    dotClassName: "bg-white/30",
  },
}

export const JOB_STATUS_TONES: Record<JobStatus, StatusTone> = {
  draft: {
    label: "Draft",
    className: "border-white/10 bg-white/5 text-white/55",
    dotClassName: "bg-white/30",
  },
  pending: {
    label: "Pending review",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dotClassName: "bg-amber-400",
  },
  active: {
    label: "Active",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  paused: {
    label: "Paused",
    className: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    dotClassName: "bg-sky-400",
  },
  closed: {
    label: "Closed",
    className: "border-white/10 bg-white/5 text-white/55",
    dotClassName: "bg-white/30",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    dotClassName: "bg-rose-400",
  },
  suspended: {
    label: "Suspended",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    dotClassName: "bg-rose-400",
  },
}

export const USER_STATUS_TONES: Record<UserStatus, StatusTone> = {
  active: {
    label: "Active",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  suspended: {
    label: "Suspended",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    dotClassName: "bg-rose-400",
  },
}

export const INTERVIEW_STATUS_TONES: Record<string, StatusTone> = {
  scheduled: {
    label: "Scheduled",
    className: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    dotClassName: "bg-indigo-400",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    dotClassName: "bg-rose-400",
  },
  rescheduled: {
    label: "Rescheduled",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dotClassName: "bg-amber-400",
  },
}

export const ROLE_TONES = {
  seeker: {
    label: "Job Seeker",
    className: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },
  recruiter: {
    label: "Recruiter",
    className: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },
  admin: {
    label: "Admin",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
} as const
