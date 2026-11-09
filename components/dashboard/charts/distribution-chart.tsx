"use client"

import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { PieChart as PieIcon } from "lucide-react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DistributionPoint } from "@/lib/api/dashboard"
import { EmptyState } from "@/components/dashboard/empty-state"
import { cn } from "@/lib/utils"

const FALLBACK_COLORS = [
  "#818cf8",
  "#38bdf8",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#94a3b8",
]

export function DistributionChart({
  data,
  label,
  variant = "donut",
  className,
  height = 226,
}: {
  data: DistributionPoint[]
  label: string
  variant?: "donut" | "bar"
  className?: string
  height?: number
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={PieIcon}
        title="No distribution data"
        description="This chart will populate when records are returned by the API."
        compact
      />
    )
  }

  const config: ChartConfig = {
    value: { label },
  }

  const colors = data.map(
    (entry, index) => FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  )

  return (
    <div className={cn("space-y-4", className)}>
      <ChartContainer
        config={config}
        className="mx-auto aspect-auto w-full max-w-[260px]"
        style={{ height }}
      >
        {variant === "donut" ? (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ChartContainer>

      <ul className="grid gap-2">
        {data.map((entry, index) => (
          <li
            key={entry.name}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2 text-white/50">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="font-mono font-medium text-white/75 tabular-nums">
              {entry.value.toLocaleString("en-US")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
