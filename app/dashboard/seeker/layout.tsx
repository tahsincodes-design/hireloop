import { requireRole } from "@/lib/auth/session"

export default async function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("seeker")
  return children
}
