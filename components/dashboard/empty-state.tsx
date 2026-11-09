import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-6 text-center",
        compact ? "gap-2 py-7" : "gap-3 py-11",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/45">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
