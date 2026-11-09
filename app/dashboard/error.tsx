"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h1 className="font-manrope text-xl font-semibold text-white">
          This page could not be loaded
        </h1>
        <p className="text-sm leading-relaxed text-white/45">
          An unexpected error interrupted the dashboard. Your session is still
          active, so you can retry without signing in again.
        </p>
        {error.digest ? (
          <p className="font-mono text-[10px] text-white/25">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
      <Button
        onClick={reset}
        className="bg-indigo-500 text-white hover:bg-indigo-400"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
