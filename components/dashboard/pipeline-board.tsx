"use client"

import Link from "next/link"
import { ArrowRight, Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ApplicationStatusMenu,
  ApplicantProfileDialog,
} from "@/components/dashboard/application-actions"
import { EmptyState } from "@/components/dashboard/empty-state"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { APPLICATION_STATUS_TONES } from "@/lib/dashboard/status"
import { formatDate } from "@/lib/format"
import type { Application, ApplicationStatus } from "@/types/application"
import { cn } from "@/lib/utils"

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "pending", label: "New applicants" },
  { status: "reviewed", label: "Under review" },
  { status: "shortlisted", label: "Shortlisted" },
  { status: "interview", label: "Interview" },
  { status: "hired", label: "Hired" },
  { status: "rejected", label: "Rejected" },
]

export function ApplicationPipeline({
  applications,
  limitPerColumn,
  className,
}: {
  applications: Application[]
  limitPerColumn?: number
  className?: string
}) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No applicants yet"
        description="Candidates will appear in the pipeline as soon as they apply to your jobs."
        action={
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
            nativeButton={false}
            render={
              <Link href="/dashboard/recruiter/jobs">Review my jobs</Link>
            }
          />
        }
      />
    )
  }

  return (
    <div className={cn("-mx-1 overflow-x-auto pb-1", className)}>
      <div className="flex min-w-max gap-3 px-1">
        {COLUMNS.map((column) => {
          const items = applications.filter(
            (application) => application.status === column.status
          )
          const visible = limitPerColumn
            ? items.slice(0, limitPerColumn)
            : items
          const tone = APPLICATION_STATUS_TONES[column.status]

          return (
            <div
              key={column.status}
              className="w-[228px] shrink-0 rounded-xl border border-white/8 bg-white/[0.015] p-2.5"
            >
              <div className="flex items-center justify-between gap-2 px-1 pb-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
                  <span
                    className={cn("size-1.5 rounded-full", tone.dotClassName)}
                  />
                  {column.label}
                </span>
                <span className="rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-white/40 tabular-nums">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {visible.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/8 px-3 py-6 text-center text-[10px] text-white/25">
                    No candidates
                  </div>
                ) : (
                  visible.map((application) => (
                    <div
                      key={application.id}
                      className="rounded-lg border border-white/8 bg-[#0b0b12] p-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <UserAvatar
                          name={application.seekerName}
                          image={application.seekerAvatar}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-white">
                            {application.seekerName}
                          </p>
                          <p className="truncate text-[10px] text-white/35">
                            {application.jobTitle}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] text-white/25">
                        Applied {formatDate(application.appliedAt)}
                      </p>
                      {application.seekerHeadline ? (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-white/35">
                          {application.seekerHeadline}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <ApplicantProfileDialog application={application} />
                        <ApplicationStatusMenu
                          application={application}
                          compact
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {limitPerColumn && items.length > limitPerColumn ? (
                <Link
                  href={`/dashboard/recruiter/applicants?status=${column.status}`}
                  className="mt-2 flex items-center justify-center gap-1 rounded-md py-1.5 text-[10px] text-indigo-300/70 transition-colors hover:bg-indigo-400/10 hover:text-indigo-200"
                >
                  View {items.length - limitPerColumn} more
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
