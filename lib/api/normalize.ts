import { isUserRole, type UserRole } from "@/lib/roles"
import type {
  Application,
  ApplicationStatus,
  SavedJob,
} from "@/types/application"
import type {
  Interview,
  InterviewStatus,
  InterviewType,
} from "@/types/interview"
import type { Job, JobStatus, JobType } from "@/types/job"
import type { AppNotification } from "@/types/notification"
import type {
  Company,
  PlatformUser,
  Profile,
  ProfileEducation,
  ProfileExperience,
  UserStatus,
} from "@/types/user"

const LIST_KEYS = [
  "data",
  "items",
  "results",
  "records",
  "rows",
  "list",
  "users",
  "jobs",
  "applications",
  "interviews",
  "notifications",
  "reports",
  "candidates",
  "savedJobs",
  "saved_jobs",
  "saved",
] as const

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  return null
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1
}

export function asDate(value: unknown): string | null {
  const raw = asString(value)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toISOString()
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim()
        if (isRecord(item))
          return asString(item.name ?? item.label ?? item.skill)
        return null
      })
      .filter((item): item is string => Boolean(item && item.length))
  }

  const raw = asString(value)
  if (!raw) return []

  return raw
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function idOf(raw: unknown): string | null {
  if (!isRecord(raw)) return null
  return asString(raw._id ?? raw.id)
}

function nestedRecord(
  raw: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> | null {
  for (const key of keys) {
    const value = raw[key]
    if (isRecord(value)) return value
  }
  return null
}

function firstString(
  raw: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = asString(raw[key])
    if (value) return value
  }
  return null
}

export function unwrapList(
  payload: unknown,
  preferredKeys: string[] = []
): unknown[] {
  if (Array.isArray(payload)) return payload

  if (!isRecord(payload)) return []

  const keys = [...preferredKeys, ...LIST_KEYS]

  for (const key of keys) {
    const value = payload[key]
    if (Array.isArray(value)) return value
    if (isRecord(value)) {
      for (const nestedKey of keys) {
        if (Array.isArray(value[nestedKey]))
          return value[nestedKey] as unknown[]
      }
    }
  }

  const firstArray = Object.values(payload).find(Array.isArray)
  return Array.isArray(firstArray) ? firstArray : []
}

export function unwrapObject(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null
  const data = payload.data
  if (isRecord(data)) return data
  return payload
}

export function normalizeRole(value: unknown, fallback: UserRole = "seeker") {
  return isUserRole(value) ? value : fallback
}

export function normalizeUserStatus(value: unknown): UserStatus {
  const raw = asString(value)?.toLowerCase()
  if (raw === "suspended" || raw === "banned" || raw === "disabled") {
    return "suspended"
  }
  return "active"
}

export function normalizeJobStatus(value: unknown): JobStatus {
  const raw = asString(value)
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_")
  switch (raw) {
    case "draft":
      return "draft"
    case "pending":
    case "pending_review":
    case "in_review":
      return "pending"
    case "active":
    case "open":
    case "published":
      return "active"
    case "paused":
    case "on_hold":
      return "paused"
    case "closed":
    case "expired":
      return "closed"
    case "rejected":
    case "declined":
      return "rejected"
    case "suspended":
    case "removed":
      return "suspended"
    default:
      return "active"
  }
}

export function normalizeApplicationStatus(value: unknown): ApplicationStatus {
  const raw = asString(value)
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_")
  switch (raw) {
    case "reviewed":
    case "under_review":
    case "in_review":
      return "reviewed"
    case "shortlisted":
    case "short_listed":
      return "shortlisted"
    case "interview":
    case "interviewing":
    case "interview_scheduled":
      return "interview"
    case "hired":
    case "accepted":
    case "offer":
    case "offered":
      return "hired"
    case "rejected":
    case "declined":
      return "rejected"
    case "withdrawn":
    case "cancelled":
      return "withdrawn"
    case "pending":
    case "new":
    case "applied":
    default:
      return "pending"
  }
}

export function normalizeInterviewStatus(value: unknown): InterviewStatus {
  const raw = asString(value)?.toLowerCase()
  switch (raw) {
    case "completed":
    case "done":
      return "completed"
    case "cancelled":
    case "canceled":
      return "cancelled"
    case "rescheduled":
      return "rescheduled"
    default:
      return "scheduled"
  }
}

export function normalizeInterviewType(value: unknown): InterviewType {
  const raw = asString(value)?.toLowerCase()
  if (raw === "phone" || raw === "telephone") return "phone"
  if (raw === "onsite" || raw === "in-person" || raw === "in_person") {
    return "onsite"
  }
  return "video"
}

export function normalizeJobType(value: unknown): string {
  const raw = asString(value)?.toLowerCase().replace(/\s+/g, "-")
  const known: JobType[] = [
    "full-time",
    "part-time",
    "contract",
    "internship",
    "temporary",
    "remote",
  ]
  return known.find((type) => type === raw) ?? raw ?? "full-time"
}

export function normalizeUser(raw: unknown): PlatformUser | null {
  if (!isRecord(raw)) return null
  const id = idOf(raw)
  if (!id) return null

  const nestedCompany = nestedRecord(raw, ["company", "companyProfile"])
  const companyName =
    firstString(raw, ["companyName", "company_name"]) ??
    (nestedCompany
      ? firstString(nestedCompany, ["name", "companyName"])
      : null) ??
    (typeof raw.company === "string" ? asString(raw.company) : null)

  return {
    id,
    name: firstString(raw, ["name", "fullName", "full_name"]) ?? "Unnamed user",
    email: firstString(raw, ["email"]) ?? "",
    image: firstString(raw, ["image", "avatar", "avatarUrl", "photo"]),
    role: normalizeRole(raw.role),
    status:
      asBoolean(raw.banned) || asBoolean(raw.suspended)
        ? "suspended"
        : normalizeUserStatus(raw.status ?? raw.accountStatus),
    createdAt: asDate(raw.createdAt ?? raw.created_at ?? raw.registeredAt),
    updatedAt: asDate(raw.updatedAt ?? raw.updated_at),
    emailVerified: asBoolean(raw.emailVerified),
    companyName,
    headline: firstString(raw, ["headline", "professionalHeadline", "title"]),
    location: firstString(raw, ["location", "city"]),
  }
}

export function normalizeJob(raw: unknown): Job | null {
  if (!isRecord(raw)) return null
  const id = idOf(raw)
  if (!id) return null

  const company = nestedRecord(raw, ["company", "companyInfo"])
  const recruiter = nestedRecord(raw, ["recruiter", "owner", "postedBy"])
  const applicants = raw.applicants ?? raw.applications

  return {
    id,
    title:
      firstString(raw, ["title", "jobTitle", "position"]) ?? "Untitled role",
    companyId: firstString(raw, ["companyId", "company_id"]) ?? idOf(company),
    companyName:
      firstString(raw, ["companyName", "company_name"]) ??
      (company ? firstString(company, ["name", "companyName"]) : null) ??
      (typeof raw.company === "string" ? asString(raw.company) : null) ??
      "Company not provided",
    companyLogo:
      firstString(raw, ["companyLogo", "companyLogoUrl"]) ??
      (company ? firstString(company, ["logo", "logoUrl", "image"]) : null),
    recruiterId:
      firstString(raw, ["recruiterId", "recruiter_id", "ownerId"]) ??
      idOf(recruiter),
    location: firstString(raw, ["location", "jobLocation", "city"]) ?? "—",
    type: normalizeJobType(raw.type ?? raw.jobType ?? raw.employmentType),
    category: firstString(raw, ["category", "department"]),
    salaryMin: asNumber(raw.salaryMin ?? raw.minSalary),
    salaryMax: asNumber(raw.salaryMax ?? raw.maxSalary),
    salaryCurrency:
      firstString(raw, ["salaryCurrency", "currency"])?.toUpperCase() ?? "USD",
    description: firstString(raw, ["description", "jobDescription"]) ?? "",
    requirements: asStringArray(raw.requirements ?? raw.skills),
    status: normalizeJobStatus(raw.status),
    applicantsCount:
      asNumber(
        raw.applicantsCount ?? raw.applicationsCount ?? raw.applicantCount
      ) ?? (Array.isArray(applicants) ? applicants.length : null),
    postedAt: asDate(raw.postedAt ?? raw.publishedAt ?? raw.createdAt),
    deadline: asDate(raw.deadline ?? raw.closingDate ?? raw.expiresAt),
    createdAt: asDate(raw.createdAt),
    updatedAt: asDate(raw.updatedAt),
    saved: asBoolean(raw.saved),
  }
}

export function normalizeApplication(raw: unknown): Application | null {
  if (!isRecord(raw)) return null
  const id = idOf(raw)
  if (!id) return null

  const job = nestedRecord(raw, ["job", "jobId", "jobDetails"])
  const seeker = nestedRecord(raw, ["seeker", "user", "candidate", "applicant"])
  const company =
    nestedRecord(raw, ["company", "companyInfo"]) ??
    (job ? nestedRecord(job, ["company", "companyInfo"]) : null)
  const candidateSkills = asStringArray(raw.skills)

  return {
    id,
    jobId: firstString(raw, ["jobId", "job_id"]) ?? idOf(job) ?? "",
    jobTitle:
      firstString(raw, ["jobTitle", "job_title", "position"]) ??
      (job ? firstString(job, ["title", "jobTitle"]) : null) ??
      "Role not provided",
    companyName:
      firstString(raw, ["companyName", "company_name"]) ??
      (company ? firstString(company, ["name", "companyName"]) : null) ??
      (job ? firstString(job, ["companyName"]) : null) ??
      "Company not provided",
    companyLogo:
      firstString(raw, ["companyLogo"]) ??
      (company ? firstString(company, ["logo", "logoUrl"]) : null),
    seekerId:
      firstString(raw, ["seekerId", "userId", "applicantId", "candidateId"]) ??
      idOf(seeker) ??
      "",
    seekerName:
      firstString(raw, ["seekerName", "applicantName", "candidateName"]) ??
      (seeker ? firstString(seeker, ["name", "fullName"]) : null) ??
      "Candidate",
    seekerEmail:
      firstString(raw, ["seekerEmail", "applicantEmail", "email"]) ??
      (seeker ? firstString(seeker, ["email"]) : null),
    seekerAvatar:
      firstString(raw, ["seekerAvatar", "avatar"]) ??
      (seeker ? firstString(seeker, ["image", "avatar", "avatarUrl"]) : null),
    seekerHeadline:
      firstString(raw, ["seekerHeadline", "headline"]) ??
      (seeker ? firstString(seeker, ["headline", "title"]) : null),
    seekerSkills:
      candidateSkills.length > 0
        ? candidateSkills
        : seeker
          ? asStringArray(seeker.skills)
          : [],
    seekerExperienceYears:
      asNumber(raw.experienceYears ?? raw.experience) ??
      (seeker ? asNumber(seeker.experienceYears ?? seeker.experience) : null),
    status: normalizeApplicationStatus(raw.status),
    resumeUrl:
      firstString(raw, ["resumeUrl", "resume_url"]) ??
      (isRecord(raw.resume) ? firstString(raw.resume, ["url"]) : null),
    coverLetter: firstString(raw, ["coverLetter", "cover_letter"]),
    appliedAt: asDate(raw.appliedAt ?? raw.createdAt ?? raw.applied_at),
    updatedAt: asDate(raw.updatedAt ?? raw.updated_at),
  }
}

export function normalizeSavedJob(raw: unknown): SavedJob | null {
  if (!isRecord(raw)) return null
  const nestedJob = raw.job
  const job = normalizeJob(isRecord(nestedJob) ? nestedJob : raw)
  if (!job) return null

  return {
    id: idOf(raw) ?? job.id,
    job,
    savedAt: asDate(raw.savedAt ?? raw.createdAt),
  }
}

export function normalizeInterview(raw: unknown): Interview | null {
  if (!isRecord(raw)) return null
  const id = idOf(raw)
  if (!id) return null

  const job = nestedRecord(raw, ["job", "jobDetails"])
  const candidate = nestedRecord(raw, [
    "candidate",
    "seeker",
    "applicant",
    "user",
  ])
  const recruiter = nestedRecord(raw, ["recruiter", "interviewer"])
  const company =
    nestedRecord(raw, ["company"]) ??
    (job ? nestedRecord(job, ["company"]) : null)

  return {
    id,
    applicationId: firstString(raw, ["applicationId"]),
    jobId: firstString(raw, ["jobId"]) ?? idOf(job),
    jobTitle:
      firstString(raw, ["jobTitle", "position"]) ??
      (job ? firstString(job, ["title", "jobTitle"]) : null) ??
      "Role not provided",
    companyName:
      firstString(raw, ["companyName"]) ??
      (company ? firstString(company, ["name"]) : null) ??
      (job ? firstString(job, ["companyName"]) : null) ??
      "Company not provided",
    companyLogo: firstString(raw, ["companyLogo"]),
    candidateId:
      firstString(raw, ["candidateId", "seekerId", "userId"]) ??
      idOf(candidate),
    candidateName:
      firstString(raw, ["candidateName"]) ??
      (candidate ? firstString(candidate, ["name", "fullName"]) : null) ??
      "Candidate",
    candidateAvatar:
      firstString(raw, ["candidateAvatar"]) ??
      (candidate ? firstString(candidate, ["image", "avatar"]) : null),
    recruiterId: firstString(raw, ["recruiterId"]) ?? idOf(recruiter),
    recruiterName:
      firstString(raw, ["recruiterName"]) ??
      (recruiter ? firstString(recruiter, ["name"]) : null),
    scheduledAt: asDate(
      raw.scheduledAt ?? raw.date ?? raw.startTime ?? raw.interviewDate
    ),
    durationMinutes: asNumber(raw.durationMinutes ?? raw.duration),
    type: normalizeInterviewType(raw.type ?? raw.interviewType),
    status: normalizeInterviewStatus(raw.status),
    meetingLink: firstString(raw, ["meetingLink", "meetingUrl", "link"]),
    location: firstString(raw, ["location", "address"]),
    notes: firstString(raw, ["notes", "description"]),
    createdAt: asDate(raw.createdAt),
  }
}

export function normalizeNotification(raw: unknown): AppNotification | null {
  if (!isRecord(raw)) return null
  const id = idOf(raw)
  if (!id) return null

  const rawType = asString(raw.type)?.toLowerCase()
  const type: AppNotification["type"] =
    rawType === "application" ||
    rawType === "interview" ||
    rawType === "job" ||
    rawType === "system"
      ? rawType
      : "system"

  return {
    id,
    title: firstString(raw, ["title", "subject"]) ?? "Notification",
    message: firstString(raw, ["message", "body", "description"]) ?? "",
    type,
    read: asBoolean(raw.read ?? raw.isRead),
    href: firstString(raw, ["href", "url", "link"]),
    createdAt: asDate(raw.createdAt),
  }
}

function normalizeEducation(raw: unknown): ProfileEducation | null {
  if (!isRecord(raw)) return null
  return {
    id: idOf(raw) ?? crypto.randomUUID(),
    school: firstString(raw, ["school", "institution", "name"]) ?? "School",
    degree: firstString(raw, ["degree"]),
    fieldOfStudy: firstString(raw, ["fieldOfStudy", "field", "major"]),
    startDate: asDate(raw.startDate),
    endDate: asDate(raw.endDate),
  }
}

function normalizeExperience(raw: unknown): ProfileExperience | null {
  if (!isRecord(raw)) return null
  return {
    id: idOf(raw) ?? crypto.randomUUID(),
    company: firstString(raw, ["company", "companyName"]) ?? "Company",
    title: firstString(raw, ["title", "role", "position"]) ?? "Role",
    location: firstString(raw, ["location"]),
    startDate: asDate(raw.startDate),
    endDate: asDate(raw.endDate),
    current: asBoolean(raw.current),
    description: firstString(raw, ["description"]),
  }
}

export function normalizeProfile(raw: unknown): Profile | null {
  const record = unwrapObject(raw)
  if (!record) return null

  const user = nestedRecord(record, ["user"])
  const education = Array.isArray(record.education)
    ? record.education
        .map(normalizeEducation)
        .filter((item): item is ProfileEducation => Boolean(item))
    : []
  const experience = Array.isArray(record.experience)
    ? record.experience
        .map(normalizeExperience)
        .filter((item): item is ProfileExperience => Boolean(item))
    : []

  return {
    id: idOf(record) ?? "me",
    userId: firstString(record, ["userId", "user_id"]) ?? idOf(user) ?? "",
    headline: firstString(record, ["headline", "professionalHeadline"]),
    bio: firstString(record, ["bio", "summary", "about"]),
    location: firstString(record, ["location", "city"]),
    phone: firstString(record, ["phone", "phoneNumber"]),
    website: firstString(record, ["website", "portfolio"]),
    skills: asStringArray(record.skills),
    education,
    experience,
    resumeUrl:
      firstString(record, ["resumeUrl", "resume_url"]) ??
      (isRecord(record.resume) ? firstString(record.resume, ["url"]) : null),
    resumeName:
      firstString(record, ["resumeName", "resumeFileName"]) ??
      (isRecord(record.resume) ? firstString(record.resume, ["name"]) : null),
    avatarUrl:
      firstString(record, ["avatarUrl", "image"]) ??
      (user ? firstString(user, ["image", "avatar"]) : null),
    updatedAt: asDate(record.updatedAt ?? record.updated_at),
  }
}

export function normalizeCompany(raw: unknown): Company | null {
  const record = unwrapObject(raw)
  if (!record) return null
  const id = idOf(record)
  if (!id) return null

  return {
    id,
    name: firstString(record, ["name", "companyName"]) ?? "Company",
    logo: firstString(record, ["logo", "logoUrl", "image"]),
    website: firstString(record, ["website", "url"]),
    industry: firstString(record, ["industry", "sector"]),
    size: firstString(record, ["size", "companySize"]),
    location: firstString(record, ["location", "headquarters"]),
    description: firstString(record, ["description", "about"]),
    ownerId: firstString(record, ["ownerId", "recruiterId", "userId"]),
  }
}

export function normalizeReport(
  raw: unknown
): import("@/types/report").Report | null {
  if (!isRecord(raw)) return null
  const id = idOf(raw)
  if (!id) return null

  const target = nestedRecord(raw, ["target", "job", "user"])
  const reporter = nestedRecord(raw, ["reporter", "reportedBy"])

  const rawTargetType = asString(raw.targetType)?.toLowerCase()
  const targetType =
    rawTargetType === "user" ||
    rawTargetType === "job" ||
    rawTargetType === "application"
      ? rawTargetType
      : "job"

  const rawStatus = asString(raw.status)?.toLowerCase()
  const status =
    rawStatus === "reviewing" ||
    rawStatus === "resolved" ||
    rawStatus === "dismissed"
      ? rawStatus
      : "open"

  return {
    id,
    targetType,
    targetId: firstString(raw, ["targetId"]) ?? idOf(target),
    targetName:
      firstString(raw, ["targetName", "subject"]) ??
      (target ? firstString(target, ["title", "name"]) : null) ??
      "Unknown target",
    reason: firstString(raw, ["reason", "category"]) ?? "Reported content",
    details: firstString(raw, ["details", "description", "message"]),
    status,
    reporterId: firstString(raw, ["reporterId"]) ?? idOf(reporter),
    reporterName:
      firstString(raw, ["reporterName"]) ??
      (reporter ? firstString(reporter, ["name"]) : null),
    createdAt: asDate(raw.createdAt ?? raw.reportedAt),
    resolvedAt: asDate(raw.resolvedAt),
  }
}

export function countByStatus<T extends { status: string }>(
  items: T[]
): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1
    return counts
  }, {})
}
