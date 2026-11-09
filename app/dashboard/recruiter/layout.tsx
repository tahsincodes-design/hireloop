import { requireRole } from "@/lib/auth/session"

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("recruiter")
  return children
}
