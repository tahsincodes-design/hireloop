"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartNoAxesCombined } from "lucide-react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { SeriesPoint } from "@/lib/api/dashboard"
import { EmptyState } from "@/components/dashboard/empty-state"

export function TrendChart({
  data,
  label,
  color = "#818cf8",
  height = 240,
  emptyDescription = "Activity will appear here once the API returns records.",
}: {
  data: SeriesPoint[]
  label: string
  color?: string
  height?: number
  emptyDescription?: string
}) {
  const gradientId = `trend-${useId().replace(/:/g, "")}`
  const config: ChartConfig = {
    value: { label, color },
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={ChartNoAxesCombined}
        title="No activity yet"
        description={emptyDescription}
        compact
      />
    )
  }

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height }}
    >
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.32} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={30}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={label}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 4, strokeWidth: 0, fill: color }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
