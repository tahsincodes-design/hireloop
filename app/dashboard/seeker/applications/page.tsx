import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, FileText, Search } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { WithdrawApplicationButton } from "@/components/dashboard/application-actions"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge"
import { loadApplications } from "@/lib/api/dashboard"
import { APPLICATION_STATUS_TONES } from "@/lib/dashboard/status"
import {
  firstParam,
  type DashboardSearchParams,
} from "@/lib/dashboard/search-params"
import { formatDate, titleCase } from "@/lib/format"
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/types/application"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My Applications · HireLoop",
}

function isApplicationStatus(
  value: string | undefined
): value is ApplicationStatus {
  return APPLICATION_STATUSES.some((status) => status === value)
}

export default async function SeekerApplicationsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const params = await searchParams
  const statusParam = firstParam(params.status)
  const status = isApplicationStatus(statusParam) ? statusParam : undefined

  const section = await loadApplications({ scope: "mine", status })
  const applications = section.data ?? []
  const canWithdraw = (value: ApplicationStatus) =>
    value === "pending" ||
    value === "reviewed" ||
    value === "shortlisted" ||
    value === "interview"

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Applications"
        title="Track every application"
        description="See where each application stands, withdraw when plans change, and keep momentum going."
        actions={
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <Search className="size-4" aria-hidden="true" />
            Find jobs
          </Link>
        }
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <nav
        aria-label="Filter applications by status"
        className="flex flex-wrap gap-1.5"
      >
        <Link
          href="/dashboard/seeker/applications"
          className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
            !status
              ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
              : "border-white/8 bg-white/[0.02] text-white/45 hover:text-white/75"
          )}
        >
          All statuses
        </Link>
        {APPLICATION_STATUSES.map((item) => {
          const active = status === item
          return (
            <Link
              key={item}
              href={`/dashboard/seeker/applications?status=${item}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                active
                  ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
                  : "border-white/8 bg-white/[0.02] text-white/45 hover:text-white/75"
              )}
            >
              {APPLICATION_STATUS_TONES[item].label}
            </Link>
          )
        })}
      </nav>

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={
            status
              ? `You have no applications marked as ${titleCase(status).toLowerCase()}.`
              : "When you apply to a role, it will show up here with live status updates."
          }
          action={
            <Link
              href="/dashboard/seeker/jobs"
              className="text-[11px] text-indigo-300 hover:text-indigo-200"
            >
              Browse open roles
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8">
          <ul className="divide-y divide-white/6">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex flex-col gap-3 bg-white/[0.01] p-3.5 sm:flex-row sm:items-center"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[11px] font-semibold text-indigo-200">
                  {application.companyName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-white">
                      {application.jobTitle}
                    </p>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <p className="truncate text-[11px] text-white/35">
                    {application.companyName} · Applied{" "}
                    {formatDate(application.appliedAt)}
                  </p>
                  {application.coverLetter ? (
                    <p className="mt-1 line-clamp-1 max-w-2xl text-[11px] text-white/30">
                      {application.coverLetter}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {application.resumeUrl ? (
                    <Link
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <ExternalLink className="size-3" aria-hidden="true" />
                      Resume
                    </Link>
                  ) : null}
                  {canWithdraw(application.status) ? (
                    <WithdrawApplicationButton application={application} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
