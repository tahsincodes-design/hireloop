"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { JobStatusBadge } from "@/components/dashboard/status-badge"
import { SaveJobButton } from "@/components/dashboard/save-job-button"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { formatDate, formatSalary, titleCase, truncate } from "@/lib/format"
import type { Job } from "@/types/job"

export function JobDetailDialog({
  job,
  saved = false,
  canApply = false,
  trigger,
  hideTrigger = false,
  open: controlledOpen,
  onOpenChange,
}: {
  job: Job
  saved?: boolean
  canApply?: boolean
  trigger?: React.ReactNode
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const router = useRouter()
  const [coverLetter, setCoverLetter] = useState("")
  const [pending, setPending] = useState(false)
  const [applied, setApplied] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || applied) return
    setPending(true)

    try {
      await api.post(endpoints.applications, {
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined,
      })
      setApplied(true)
      notifySuccess(
        "Application submitted",
        `Your application for ${job.title} is now pending review.`
      )
      setOpen(false)
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not submit your application.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hideTrigger ? null : (
        <DialogTrigger
          render={
            trigger ? (
              (trigger as React.ReactElement)
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
              />
            )
          }
        >
          {trigger ? null : "View details"}
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[88svh] overflow-y-auto border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-8">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-indigo-200">
              {job.companyName.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="font-manrope text-lg leading-tight text-white">
                {job.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/45">
                {job.companyName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <JobStatusBadge status={job.status} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/50">
            <MapPin className="size-3" aria-hidden="true" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/50">
            <Briefcase className="size-3" aria-hidden="true" />
            {titleCase(job.type)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/50">
            <CalendarDays className="size-3" aria-hidden="true" />
            Posted {formatDate(job.postedAt)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="text-[10px] font-medium tracking-[0.14em] text-white/30 uppercase">
              Salary
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="text-[10px] font-medium tracking-[0.14em] text-white/30 uppercase">
              Application deadline
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {formatDate(job.deadline, "No deadline")}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[13px] font-medium text-white">About the role</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-white/50">
            {job.description || "No description was provided for this role."}
          </p>
        </div>

        {job.requirements.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-[13px] font-medium text-white">Requirements</h3>
            <ul className="flex flex-wrap gap-1.5">
              {job.requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/55"
                  title={requirement}
                >
                  {truncate(requirement, 48)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {canApply ? (
          <form
            onSubmit={handleApply}
            className="space-y-3 rounded-xl border border-indigo-400/15 bg-indigo-400/[0.04] p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor={`cover-letter-${job.id}`}
                className="text-[13px] text-white/70"
              >
                Cover letter (optional)
              </Label>
              {applied ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Applied
                </span>
              ) : null}
            </div>
            <Textarea
              id={`cover-letter-${job.id}`}
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Tell the recruiter why you are a strong fit…"
              disabled={pending || applied}
              className="min-h-24 border-white/10 bg-black/20 text-sm text-white placeholder:text-white/25"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-white/30">
                Your application is sent to the Express API for validation.
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={pending || applied}
                className="bg-indigo-500 text-white hover:bg-indigo-400"
              >
                {pending ? (
                  <Loader2
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : applied ? (
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <Send className="size-3.5" aria-hidden="true" />
                )}
                {applied ? "Application sent" : "Apply now"}
              </Button>
            </div>
          </form>
        ) : null}

        <DialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
          <SaveJobButton
            jobId={job.id}
            initialSaved={saved}
            showLabel
            className="border border-white/10 bg-transparent"
          />
          <DialogClose
            render={
              <Button
                variant="outline"
                className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
              />
            }
          >
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
