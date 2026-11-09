import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROLE_META } from "@/lib/dashboard/navigation"
import type { UserRole } from "@/lib/roles"

export function RoleForbidden({
  currentRole,
  requiredRole,
}: {
  currentRole: UserRole
  requiredRole: UserRole
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h1 className="font-manrope text-xl font-semibold text-white">
          Access denied
        </h1>
        <p className="text-sm leading-relaxed text-white/45">
          You are signed in as a {ROLE_META[currentRole].label.toLowerCase()}.
          The {ROLE_META[requiredRole].label.toLowerCase()} workspace only
          accepts {ROLE_META[requiredRole].label.toLowerCase()} accounts.
        </p>
      </div>
      <Button
        variant="outline"
        className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
        nativeButton={false}
        render={<Link href="/dashboard">Go to my dashboard</Link>}
      />
    </div>
  )
}
