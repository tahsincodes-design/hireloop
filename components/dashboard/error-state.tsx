import { AlertCircle, ServerCrash, ShieldAlert, WifiOff } from "lucide-react"

import type { ApiFailure } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const TITLES: Record<ApiFailure["kind"], string> = {
  http: "The API rejected this request",
  network: "Could not reach the API",
  timeout: "The API request timed out",
  unauthorized: "Sign in to continue",
  forbidden: "You do not have access",
  not_found: "Backend endpoint not available yet",
  invalid_response: "Unexpected API response",
  server: "The API encountered an error",
}

function FailureIcon({ kind }: { kind: ApiFailure["kind"] }) {
  if (kind === "network" || kind === "timeout") {
    return <WifiOff className="size-4" aria-hidden="true" />
  }
  if (kind === "forbidden" || kind === "unauthorized") {
    return <ShieldAlert className="size-4" aria-hidden="true" />
  }
  if (kind === "server") {
    return <ServerCrash className="size-4" aria-hidden="true" />
  }
  return <AlertCircle className="size-4" aria-hidden="true" />
}

export function ErrorState({
  failure,
  compact = false,
  className,
}: {
  failure: ApiFailure
  compact?: boolean
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-rose-400/15 bg-rose-400/[0.04] px-4 text-rose-100/80",
        compact ? "py-3" : "py-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-400/10 text-rose-300">
          <FailureIcon kind={failure.kind} />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-rose-200">
            {TITLES[failure.kind]}
          </p>
          <p className="text-xs leading-relaxed text-rose-100/55">
            {failure.message}
          </p>
          <p className="text-[11px] text-rose-100/35">
            Endpoint:{" "}
            <code className="rounded bg-black/20 px-1 py-0.5 font-mono">
              {failure.requiredEndpoint}
            </code>
            {failure.status ? ` · HTTP ${failure.status}` : null}
          </p>
        </div>
      </div>
    </div>
  )
}
