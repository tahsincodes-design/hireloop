"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { cn } from "@/lib/utils"

export function SaveJobButton({
  jobId,
  initialSaved = false,
  className,
  showLabel = false,
}: {
  jobId: string
  initialSaved?: boolean
  className?: string
  showLabel?: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, setPending] = useState(false)

  async function toggle() {
    if (pending) return
    setPending(true)

    try {
      if (saved) {
        await api.delete(endpoints.savedJob(jobId))
        setSaved(false)
        notifySuccess("Job removed from saved jobs")
      } else {
        await api.post(endpoints.savedJobs, { jobId })
        setSaved(true)
        notifySuccess("Job saved", "Find it again under Saved Jobs.")
      }
    } catch (error) {
      notifyApiError(error, "Could not update the saved job.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon-sm"}
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Unsave job" : "Save job"}
      className={cn(
        "text-white/45 hover:bg-white/[0.06] hover:text-white",
        saved && "text-indigo-300 hover:text-indigo-200",
        className
      )}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : saved ? (
        <BookmarkCheck className="size-3.5" aria-hidden="true" />
      ) : (
        <Bookmark className="size-3.5" aria-hidden="true" />
      )}
      {showLabel ? (saved ? "Saved" : "Save job") : null}
    </Button>
  )
}
