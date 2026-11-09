import { ChevronDown, PlugZap } from "lucide-react"

import type { ApiFailure } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export function ApiNotice({
  failures,
  className,
}: {
  failures: ApiFailure[]
  className?: string
}) {
  if (failures.length === 0) return null

  const unique = failures.filter(
    (failure, index, list) =>
      list.findIndex(
        (candidate) => candidate.requiredEndpoint === failure.requiredEndpoint
      ) === index
  )

  return (
    <details
      className={cn(
        "group rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3 text-amber-100/80",
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 text-sm font-medium text-amber-200 [&::-webkit-details-marker]:hidden">
        <span className="flex size-7 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/10 text-amber-300">
          <PlugZap className="size-4" aria-hidden="true" />
        </span>
        <span className="flex-1">
          {unique.length} backend integration
          {unique.length === 1 ? "" : "s"} need attention
        </span>
        <ChevronDown
          className="size-4 text-amber-300/60 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3 space-y-2 border-t border-amber-400/10 pt-3">
        <p className="text-xs leading-relaxed text-amber-100/55">
          HireLoop does not display fabricated data. These sections will appear
          automatically once the Express API implements the endpoints below.
        </p>
        <ul className="grid gap-1.5">
          {unique.map((failure) => (
            <li
              key={`${failure.key}-${failure.requiredEndpoint}`}
              className="flex flex-wrap items-center gap-2 text-[11px]"
            >
              <code className="rounded bg-black/25 px-1.5 py-0.5 font-mono text-amber-100/80">
                {failure.requiredEndpoint}
              </code>
              <span className="text-amber-100/40">
                {failure.status ? `HTTP ${failure.status}` : failure.kind}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
