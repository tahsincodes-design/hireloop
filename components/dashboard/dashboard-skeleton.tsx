import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64 bg-white/5" />
        <Skeleton className="h-4 w-full max-w-lg bg-white/5" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[106px] rounded-2xl bg-white/5" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-2xl bg-white/5 xl:col-span-2" />
        <Skeleton className="h-[340px] rounded-2xl bg-white/5" />
      </div>

      <Skeleton className="h-[300px] rounded-2xl bg-white/5" />
    </div>
  )
}
