import { Briefcase, MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JobDetailDialog } from "@/components/dashboard/job-detail-dialog"
import { JobStatusBadge } from "@/components/dashboard/status-badge"
import { SaveJobButton } from "@/components/dashboard/save-job-button"
import { formatDate, formatSalary, titleCase } from "@/lib/format"
import type { Job } from "@/types/job"
import { cn } from "@/lib/utils"

export function JobCard({
  job,
  saved = false,
  canApply = true,
  className,
}: {
  job: Job
  saved?: boolean
  canApply?: boolean
  className?: string
}) {
  return (
    <Card
      className={cn(
        "group gap-0 rounded-2xl border border-white/8 bg-[#0b0b12] py-0 text-white ring-0 transition-colors hover:border-indigo-400/25",
        className
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-indigo-200">
            {job.companyName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-manrope text-sm font-semibold text-white">
              {job.title}
            </h3>
            <p className="truncate text-[11px] text-white/40">
              {job.companyName}
            </p>
          </div>
          <SaveJobButton jobId={job.id} initialSaved={saved} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" aria-hidden="true" />
            {job.location}
          </span>
          <span className="text-white/15">·</span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="size-3" aria-hidden="true" />
            {titleCase(job.type)}
          </span>
          <span className="text-white/15">·</span>
          <span>
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <JobStatusBadge status={job.status} />
          <span className="text-[10px] text-white/30">
            {formatDate(job.postedAt)}
          </span>
        </div>

        {job.requirements.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 3).map((requirement) => (
              <li
                key={requirement}
                className="max-w-full truncate rounded-full border border-white/8 bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/40"
              >
                {requirement}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <JobDetailDialog
            job={job}
            saved={saved}
            canApply={canApply}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full border-white/10 bg-transparent text-[12px] text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                View details & apply
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
