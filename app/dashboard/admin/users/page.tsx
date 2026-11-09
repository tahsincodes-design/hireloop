import type { Metadata } from "next"
import { Users } from "lucide-react"

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
  title: "User Management · HireLoop",
}

export default async function AdminUsersPage({
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
  const query = firstParam(params.q) ?? ""

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Platform"
        title="User management"
        description="Change roles, suspend abusive accounts, and keep every HireLoop account healthy."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.ok ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total users"
            value={stats.total}
            icon={Users}
            tone="indigo"
          />
          <StatCard
            label="Job seekers"
            value={stats.seeker}
            icon={Users}
            tone="sky"
          />
          <StatCard
            label="Recruiters"
            value={stats.recruiter}
            icon={Users}
            tone="violet"
          />
          <StatCard
            label="Admins"
            value={stats.admin}
            icon={Users}
            tone="amber"
          />
          <StatCard
            label="Suspended"
            value={stats.suspended}
            icon={Users}
            tone="rose"
          />
        </div>
      ) : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : (
        <UsersTable
          users={users}
          currentUserId={user.id}
          initialQuery={query}
        />
      )}
    </div>
  )
}
