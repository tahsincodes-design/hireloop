import type { Metadata } from "next"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SuspendedNotice } from "@/components/dashboard/suspended-notice"
import { requireSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Dashboard · HireLoop",
  description: "Manage your HireLoop workspace.",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireSessionUser()

  if (user.status === "suspended") {
    return <SuspendedNotice email={user.email} />
  }

  return (
    <DashboardShell user={user} role={user.role}>
      {children}
    </DashboardShell>
  )
}
