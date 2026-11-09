"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { APPLICATION_STATUS_TONES } from "@/lib/dashboard/status"
import { formatDate, titleCase } from "@/lib/format"
import type { Application, ApplicationStatus } from "@/types/application"

const PIPELINE_STATUSES: ApplicationStatus[] = [
  "pending",
  "reviewed",
  "shortlisted",
  "interview",
  "hired",
  "rejected",
]

export function ApplicationStatusMenu({
  application,
  compact = false,
}: {
  application: Application
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState<ApplicationStatus | null>(null)

  async function updateStatus(status: ApplicationStatus) {
    if (pending || status === application.status) return
    setPending(status)

    try {
      await api.patch(endpoints.application(application.id), { status })
      notifySuccess(
        "Application updated",
        `${application.seekerName} moved to ${APPLICATION_STATUS_TONES[status].label}.`
      )
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not update the application status.")
    } finally {
      setPending(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant={compact ? "ghost" : "outline"}
            size={compact ? "icon-sm" : "sm"}
            aria-label="Update application status"
            className={
              compact
                ? "text-white/35 hover:bg-white/[0.06] hover:text-white"
                : "border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
            }
          />
        }
      >
        {compact ? (
          pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <MoreHorizontal className="size-4" aria-hidden="true" />
          )
        ) : pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Updating…
          </>
        ) : (
          "Move stage"
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 border border-white/10 bg-[#0d0d16] p-1.5 text-white shadow-xl ring-0"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[10px] tracking-wide text-white/30 uppercase">
          Move to
        </DropdownMenuLabel>
        {PIPELINE_STATUSES.map((status) => {
          const tone = APPLICATION_STATUS_TONES[status]
          return (
            <DropdownMenuItem
              key={status}
              disabled={pending !== null || status === application.status}
              onClick={() => updateStatus(status)}
              className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
            >
              <span className={`size-1.5 rounded-full ${tone.dotClassName}`} />
              {tone.label}
              {status === application.status ? (
                <span className="ml-auto text-[9px] text-white/25">
                  Current
                </span>
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function WithdrawApplicationButton({
  application,
}: {
  application: Application
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function withdraw() {
    if (pending) return
    setPending(true)

    try {
      await api.delete(endpoints.application(application.id))
      notifySuccess("Application withdrawn")
      setOpen(false)
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not withdraw the application.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-7 px-2 text-[11px] text-rose-300/70 hover:bg-rose-400/10 hover:text-rose-300"
      >
        Withdraw
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle
                className="size-4 text-rose-300"
                aria-hidden="true"
              />
              Withdraw application?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/45">
              This removes your application for {application.jobTitle} at{" "}
              {application.companyName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
            <AlertDialogCancel
              disabled={pending}
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
            >
              Keep application
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={withdraw}
              disabled={pending}
              className="bg-rose-500 text-white hover:bg-rose-400"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ApplicantProfileDialog({
  application,
}: {
  application: Application
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
          />
        }
      >
        View profile
      </DialogTrigger>

      <DialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={application.seekerName}
              image={application.seekerAvatar}
              size="lg"
            />
            <div className="min-w-0">
              <DialogTitle className="font-manrope text-base text-white">
                {application.seekerName}
              </DialogTitle>
              <DialogDescription className="truncate text-xs text-white/40">
                {application.seekerEmail ?? "Email not provided"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="grid gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-white/35">Applied for</span>
              <span className="text-right font-medium text-white/75">
                {application.jobTitle}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/35">Applied on</span>
              <span className="text-white/65">
                {formatDate(application.appliedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/35">Status</span>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/35">Experience</span>
              <span className="text-white/65">
                {application.seekerExperienceYears !== null
                  ? `${application.seekerExperienceYears} years`
                  : "Not provided"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
              Headline
            </p>
            <p className="text-[13px] text-white/65">
              {application.seekerHeadline ?? "No headline provided."}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
              Skills
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {application.seekerSkills.length > 0 ? (
                application.seekerSkills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/55"
                  >
                    {titleCase(skill)}
                  </li>
                ))
              ) : (
                <li className="text-xs text-white/30">
                  No skills were provided.
                </li>
              )}
            </ul>
          </div>

          {application.coverLetter ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
                Cover letter
              </p>
              <p className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-[13px] leading-relaxed whitespace-pre-line text-white/55">
                {application.coverLetter}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
          {application.resumeUrl ? (
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
              nativeButton={false}
              render={
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  Open resume
                </a>
              }
            />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-white/30">
              <UserRound className="size-3.5" aria-hidden="true" />
              No resume attached
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
