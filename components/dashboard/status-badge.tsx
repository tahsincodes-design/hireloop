import { Badge } from "@/components/ui/badge"
import {
  APPLICATION_STATUS_TONES,
  INTERVIEW_STATUS_TONES,
  JOB_STATUS_TONES,
  ROLE_TONES,
  USER_STATUS_TONES,
} from "@/lib/dashboard/status"
import type { ApplicationStatus } from "@/types/application"
import type { JobStatus } from "@/types/job"
import type { UserRole } from "@/lib/roles"
import type { UserStatus } from "@/types/user"
import { cn } from "@/lib/utils"

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  const tone = APPLICATION_STATUS_TONES[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tone.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone.dotClassName)} />
      {tone.label}
    </Badge>
  )
}

export function JobStatusBadge({
  status,
  className,
}: {
  status: JobStatus
  className?: string
}) {
  const tone = JOB_STATUS_TONES[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tone.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone.dotClassName)} />
      {tone.label}
    </Badge>
  )
}

export function UserStatusBadge({
  status,
  className,
}: {
  status: UserStatus
  className?: string
}) {
  const tone = USER_STATUS_TONES[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tone.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone.dotClassName)} />
      {tone.label}
    </Badge>
  )
}

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole
  className?: string
}) {
  const tone = ROLE_TONES[role]
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tone.className,
        className
      )}
    >
      {tone.label}
    </Badge>
  )
}

export function InterviewStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const tone =
    INTERVIEW_STATUS_TONES[status] ?? INTERVIEW_STATUS_TONES.scheduled
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tone.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone.dotClassName)} />
      {tone.label}
    </Badge>
  )
}
