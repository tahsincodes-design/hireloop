"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { JobForm } from "@/components/dashboard/job-form"
import type { Job } from "@/types/job"

export function JobFormDialog({
  job,
  triggerLabel = "Edit job",
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  job: Job
  triggerLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hideTrigger ? null : (
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
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] overflow-y-auto border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-manrope text-lg text-white">
            Edit job
          </DialogTitle>
          <DialogDescription className="text-white/45">
            Changes are saved through the Express API and revalidated on this
            page.
          </DialogDescription>
        </DialogHeader>
        <JobForm job={job} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
