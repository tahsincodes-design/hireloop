"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react"

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
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import type { Interview } from "@/types/interview"

type PendingAction = "completed" | "cancelled" | null

export function InterviewActions({ interview }: { interview: Interview }) {
  const router = useRouter()
  const [pending, setPending] = useState<PendingAction>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const canAct =
    interview.status === "scheduled" || interview.status === "rescheduled"

  async function updateStatus(status: "completed" | "cancelled") {
    if (pending) return
    setPending(status)

    try {
      await api.patch(endpoints.interview(interview.id), { status })
      notifySuccess(
        status === "completed" ? "Interview completed" : "Interview cancelled",
        `${interview.candidateName || interview.jobTitle}`
      )
      setConfirmCancel(false)
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not update the interview.")
    } finally {
      setPending(null)
    }
  }

  if (!canAct) return null

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => updateStatus("completed")}
        disabled={pending !== null}
        className="h-7 text-[11px] text-emerald-300/70 hover:bg-emerald-400/10 hover:text-emerald-300"
      >
        {pending === "completed" ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-3" aria-hidden="true" />
        )}
        Complete
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmCancel(true)}
        disabled={pending !== null}
        className="h-7 text-[11px] text-rose-300/70 hover:bg-rose-400/10 hover:text-rose-300"
      >
        {pending === "cancelled" ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <XCircle className="size-3" aria-hidden="true" />
        )}
        Cancel
      </Button>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle
                className="size-4 text-amber-300"
                aria-hidden="true"
              />
              Cancel this interview?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/45">
              {interview.candidateName || "The candidate"} will no longer see
              this interview as scheduled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
            <AlertDialogCancel
              disabled={pending !== null}
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
            >
              Keep interview
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus("cancelled")}
              disabled={pending !== null}
              className="bg-rose-500 text-white hover:bg-rose-400"
            >
              {pending === "cancelled" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              Cancel interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
