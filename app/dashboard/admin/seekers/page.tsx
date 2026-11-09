import type { Metadata } from "next"
import { UserRound } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { UsersTable } from "@/components/dashboard/users-table"
import { loadUsers } from "@/lib/api/dashboard"
import { requireSessionUser } from "@/lib/auth/session"
import { getUserStats } from "@/lib/dashboard/stats"
import {
  firstParam,
  type DashboardSearchParams,
} from "@/lib/dashboard/search-params"

export const metadata: Metadata = {
  title: "Job Seekers · HireLoop",
}

export default async function AdminSeekersPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const [user, section, params] = await Promise.all([
    requireSessionUser(),
    loadUsers(),
    searchParams,
  ])
  const users = section.data ?? []
  const stats = getUserStats(users)
  const seekers = users.filter((account) => account.role === "seeker")

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Platform"
        title="Job seeker accounts"
        description="Manage candidate accounts, suspend abuse, and keep the talent pool healthy."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.ok ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Job seekers"
            value={stats.seeker}
            icon={UserRound}
            tone="sky"
          />
          <StatCard
            label="Active seekers"
            value={
              seekers.filter((account) => account.status === "active").length
            }
            icon={UserRound}
            tone="emerald"
          />
          <StatCard
            label="Suspended"
            value={
              seekers.filter((account) => account.status === "suspended").length
            }
            icon={UserRound}
            tone="rose"
          />
        </div>
      ) : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : (
        <UsersTable
          users={seekers}
          currentUserId={user.id}
          lockRoleTo="seeker"
          initialQuery={firstParam(params.q) ?? ""}
        />
      )}
    </div>
  )
}
