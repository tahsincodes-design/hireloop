import { AdminOverviewView } from "@/components/dashboard/admin-overview"
import { RecruiterOverviewView } from "@/components/dashboard/recruiter-overview"
import { SeekerOverviewView } from "@/components/dashboard/seeker-overview"
import {
  loadAdminOverview,
  loadRecruiterOverview,
  loadSeekerOverview,
} from "@/lib/api/dashboard"
import { requireSessionUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireSessionUser()

  if (user.role === "recruiter") {
    const overview = await loadRecruiterOverview()
    return <RecruiterOverviewView user={user} overview={overview} />
  }

  if (user.role === "admin") {
    const overview = await loadAdminOverview()
    return <AdminOverviewView user={user} overview={overview} />
  }

  const overview = await loadSeekerOverview()
  return <SeekerOverviewView user={user} overview={overview} />
}
