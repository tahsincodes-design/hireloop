import type { Metadata } from "next"
import Link from "next/link"
import { FileText, ListChecks } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { ApplicationPipeline } from "@/components/dashboard/pipeline-board"
import { SectionCard } from "@/components/dashboard/section-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { loadApplications } from "@/lib/api/dashboard"
import { getApplicationStats } from "@/lib/dashboard/stats"
import { cn } from "@/lib/utils"
import {
  firstParam,
  type DashboardSearchParams,
} from "@/lib/dashboard/search-params"
import { APPLICATION_STATUS_TONES } from "@/lib/dashboard/status"
import { APPLICATION_STATUSES } from "@/types/application"

export const metadata: Metadata = {
  title: "Applications · HireLoop",
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const params = await searchParams
  const statusParam = firstParam(params.status)
  const status = APPLICATION_STATUSES.find((item) => item === statusParam)

  const section = await loadApplications({ scope: "all", status })
  const applications = section.data ?? []
  const stats = getApplicationStats(applications)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Platform"
        title="Application oversight"
        description="Monitor every application and hiring stage across HireLoop."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.ok ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Applications"
            value={stats.total}
            icon={FileText}
            tone="indigo"
          />
          <StatCard
            label="In review"
            value={stats.pending + stats.reviewed}
            icon={ListChecks}
            tone="amber"
          />
          <StatCard
            label="Interviewing"
            value={stats.interview}
            icon={ListChecks}
            tone="violet"
          />
          <StatCard
            label="Hired"
            value={stats.hired}
            icon={ListChecks}
            tone="emerald"
          />
        </div>
      ) : null}

      <nav
        aria-label="Filter applications by status"
        className="flex flex-wrap gap-1.5"
      >
        <Link
          href="/dashboard/admin/applications"
          className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
            !status
              ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
              : "border-white/8 bg-white/[0.02] text-white/45 hover:text-white/75"
          )}
        >
          All stages
        </Link>
        {APPLICATION_STATUSES.map((item) => (
          <Link
            key={item}
            href={`/dashboard/admin/applications?status=${item}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
              status === item
                ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
                : "border-white/8 bg-white/[0.02] text-white/45 hover:text-white/75"
            )}
          >
            {APPLICATION_STATUS_TONES[item].label}
          </Link>
        ))}
      </nav>

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="Applications will appear here once candidates start applying."
        />
      ) : (
        <SectionCard
          title="Platform pipeline"
          description="Drag-free stage management with per-candidate actions."
          contentClassName="p-3 sm:p-4"
        >
          <ApplicationPipeline applications={applications} />
        </SectionCard>
      )}
    </div>
  )
}
