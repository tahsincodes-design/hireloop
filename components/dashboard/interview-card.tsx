import type { ReactNode } from "react"
import {
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  UserRound,
  Video,
} from "lucide-react"

import { InterviewStatusBadge } from "@/components/dashboard/status-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { formatDate, formatDateTime, titleCase } from "@/lib/format"
import type { Interview } from "@/types/interview"
import { cn } from "@/lib/utils"

const TYPE_ICON = {
  video: Video,
  phone: UserRound,
  onsite: MapPin,
} as const

export function InterviewCard({
  interview,
  perspective = "seeker",
  actions,
  className,
}: {
  interview: Interview
  perspective?: "seeker" | "recruiter"
  actions?: ReactNode
  className?: string
}) {
  const Icon = TYPE_ICON[interview.type] ?? CalendarDays

  return (
    <article
      className={cn(
        "rounded-xl border border-white/8 bg-white/[0.02] p-3.5 transition-colors hover:border-white/12",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10 text-indigo-300">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-medium text-white">
              {interview.jobTitle}
            </h3>
            <p className="truncate text-[11px] text-white/40">
              {interview.companyName}
            </p>
          </div>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>

      <div className="mt-3 grid gap-1.5 text-[11px] text-white/45">
        <p className="flex items-center gap-1.5">
          <Clock className="size-3 shrink-0 text-white/25" aria-hidden="true" />
          {formatDateTime(interview.scheduledAt, "Time to be confirmed")}
          {interview.durationMinutes
            ? ` · ${interview.durationMinutes} min`
            : ""}
        </p>
        <p className="flex items-center gap-1.5">
          <Icon className="size-3 shrink-0 text-white/25" aria-hidden="true" />
          {titleCase(interview.type)}
          {interview.location ? ` · ${interview.location}` : ""}
        </p>
        <p className="flex items-center gap-1.5">
          <CalendarDays
            className="size-3 shrink-0 text-white/25"
            aria-hidden="true"
          />
          Created {formatDate(interview.createdAt)}
        </p>
      </div>

      {perspective === "recruiter" ? (
        <div className="mt-3 flex items-center gap-2 border-t border-white/6 pt-2.5">
          <UserAvatar
            name={interview.candidateName}
            image={interview.candidateAvatar}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-white/70">
              {interview.candidateName}
            </p>
            <p className="truncate text-[10px] text-white/30">Candidate</p>
          </div>
        </div>
      ) : interview.recruiterName ? (
        <p className="mt-3 border-t border-white/6 pt-2.5 text-[11px] text-white/40">
          Interviewer:{" "}
          <span className="text-white/65">{interview.recruiterName}</span>
        </p>
      ) : null}

      {interview.notes ? (
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/35">
          {interview.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {interview.meetingLink ? (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1.5 text-[11px] font-medium text-indigo-200 transition-colors hover:bg-indigo-400/15"
          >
            <ExternalLink className="size-3" aria-hidden="true" />
            Join meeting
          </a>
        ) : (
          <span />
        )}
        {actions ? <div className="flex gap-1.5">{actions}</div> : null}
      </div>
    </article>
  )
}
