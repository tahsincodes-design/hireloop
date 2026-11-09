"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarPlus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import type { Application } from "@/types/application"
import type { InterviewType } from "@/types/interview"

const fieldClass =
  "border-white/10 bg-black/20 text-white placeholder:text-white/25 focus-visible:border-indigo-400/40 focus-visible:ring-indigo-400/15 dark:bg-black/20"

const TYPE_ITEMS: { value: InterviewType; label: string }[] = [
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
  { value: "onsite", label: "On-site" },
]

export function InterviewScheduleDialog({
  applications,
  jobId,
}: {
  applications: Application[]
  jobId?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState("")
  const [type, setType] = useState<InterviewType>("video")

  const candidates = useMemo(
    () =>
      jobId
        ? applications.filter((application) => application.jobId === jobId)
        : applications,
    [applications, jobId]
  )

  const applicationItems = useMemo(
    () =>
      candidates.map((application) => ({
        value: application.id,
        label: `${application.seekerName} · ${application.jobTitle}`,
      })),
    [candidates]
  )

  const selected = candidates.find(
    (application) => application.id === applicationId
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setError(null)
    const formData = new FormData(event.currentTarget)
    const scheduledAt = String(formData.get("scheduledAt") ?? "").trim()
    const duration = String(formData.get("durationMinutes") ?? "").trim()
    const meetingLink = String(formData.get("meetingLink") ?? "").trim()
    const location = String(formData.get("location") ?? "").trim()
    const notes = String(formData.get("notes") ?? "").trim()

    if (!selected) {
      setError("Select the applicant you want to interview.")
      return
    }

    if (!scheduledAt) {
      setError("Choose a date and time for the interview.")
      return
    }

    const date = new Date(scheduledAt)
    if (Number.isNaN(date.getTime())) {
      setError("Enter a valid interview date and time.")
      return
    }

    setPending(true)

    try {
      await api.post(endpoints.interviews, {
        applicationId: selected.id,
        jobId: selected.jobId,
        candidateId: selected.seekerId,
        scheduledAt: date.toISOString(),
        durationMinutes: duration ? Number(duration) : 45,
        type,
        meetingLink: meetingLink || undefined,
        location: location || undefined,
        notes: notes || undefined,
      })
      notifySuccess(
        "Interview scheduled",
        `${selected.seekerName} · ${selected.jobTitle}`
      )
      setOpen(false)
      setApplicationId("")
      router.refresh()
    } catch (requestError) {
      notifyApiError(requestError, "Could not schedule the interview.")
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not schedule the interview."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className="bg-indigo-500 text-white hover:bg-indigo-400"
            disabled={candidates.length === 0}
          />
        }
      >
        <CalendarPlus className="size-4" aria-hidden="true" />
        Schedule interview
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-manrope text-lg text-white">
            Schedule an interview
          </DialogTitle>
          <DialogDescription className="text-white/45">
            Interview details are saved through the Express API.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-3 py-2.5 text-xs text-amber-200/80">
            There are no applicants available to interview yet.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">
                Applicant <span className="text-rose-300">*</span>
              </Label>
              <Select
                items={applicationItems}
                value={applicationId}
                onValueChange={(value) => {
                  if (typeof value === "string") setApplicationId(value)
                }}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Choose an applicant" />
                </SelectTrigger>
                <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
                  {applicationItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="interview-date"
                  className="text-xs text-white/60"
                >
                  Date & time <span className="text-rose-300">*</span>
                </Label>
                <Input
                  id="interview-date"
                  name="scheduledAt"
                  type="datetime-local"
                  required
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="interview-duration"
                  className="text-xs text-white/60"
                >
                  Duration (minutes)
                </Label>
                <Input
                  id="interview-duration"
                  name="durationMinutes"
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={45}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Format</Label>
                <Select
                  items={TYPE_ITEMS}
                  value={type}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      setType(value as InterviewType)
                    }
                  }}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
                    {TYPE_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="interview-location"
                  className="text-xs text-white/60"
                >
                  Location
                </Label>
                <Input
                  id="interview-location"
                  name="location"
                  placeholder="Office address"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interview-link" className="text-xs text-white/60">
                Meeting link
              </Label>
              <Input
                id="interview-link"
                name="meetingLink"
                placeholder="https://meet.google.com/…"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="interview-notes"
                className="text-xs text-white/60"
              >
                Notes for the candidate
              </Label>
              <Textarea
                id="interview-notes"
                name="notes"
                placeholder="Agenda, preparation tips, or panel details…"
                className={`min-h-20 ${fieldClass}`}
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-200"
              >
                {error}
              </p>
            ) : null}

            <DialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="bg-indigo-500 text-white hover:bg-indigo-400"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CalendarPlus className="size-4" aria-hidden="true" />
                )}
                {pending ? "Scheduling…" : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
