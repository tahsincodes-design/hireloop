import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const TONES = {
  indigo: "border-indigo-400/15 bg-indigo-400/10 text-indigo-300",
  sky: "border-sky-400/15 bg-sky-400/10 text-sky-300",
  violet: "border-violet-400/15 bg-violet-400/10 text-violet-300",
  emerald: "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/15 bg-amber-400/10 text-amber-300",
  rose: "border-rose-400/15 bg-rose-400/10 text-rose-300",
} as const

export type StatTone = keyof typeof TONES

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "indigo",
  unavailable = false,
  className,
}: {
  label: string
  value: number | string | null | undefined
  hint?: string
  icon: LucideIcon
  tone?: StatTone
  unavailable?: boolean
  className?: string
}) {
  const displayValue =
    unavailable || value === null || value === undefined
      ? "—"
      : typeof value === "number"
        ? formatNumber(value)
        : value

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-white/8 bg-[#0b0b12] py-0 text-white ring-0 transition-colors hover:border-white/12",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-[11px] font-medium tracking-[0.14em] text-white/40 uppercase">
              {label}
            </p>
            <p className="font-manrope text-2xl leading-none font-semibold tracking-tight text-white tabular-nums">
              {displayValue}
            </p>
            <p
              className={cn(
                "truncate text-[11px] text-white/35",
                unavailable && "text-amber-300/60"
              )}
            >
              {unavailable ? "Awaiting API data" : (hint ?? "\u00a0")}
            </p>
          </div>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl border",
              TONES[tone]
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
