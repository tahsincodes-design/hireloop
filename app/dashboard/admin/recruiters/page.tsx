import type { Metadata } from "next"
import { Building2 } from "lucide-react"

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
  title: "Recruiters · HireLoop",
}

export default async function AdminRecruitersPage({
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
  const recruiters = users.filter((account) => account.role === "recruiter")

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Platform"
        title="Recruiter accounts"
        description="Manage the companies and recruiters publishing roles on HireLoop."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.ok ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Recruiters"
            value={stats.recruiter}
            icon={Building2}
            tone="violet"
          />
          <StatCard
            label="Active recruiters"
            value={
              recruiters.filter((account) => account.status === "active").length
            }
            icon={Building2}
            tone="emerald"
          />
          <StatCard
            label="Suspended"
            value={
              recruiters.filter((account) => account.status === "suspended")
                .length
            }
            icon={Building2}
            tone="rose"
          />
        </div>
      ) : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : (
        <UsersTable
          users={recruiters}
          currentUserId={user.id}
          lockRoleTo="recruiter"
          initialQuery={firstParam(params.q) ?? ""}
        />
      )}
    </div>
  )
}
