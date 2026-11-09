import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.16em] text-indigo-300/70 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-manrope text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-white/45">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
