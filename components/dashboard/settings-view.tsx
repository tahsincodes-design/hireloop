import Link from "next/link"
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Server,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AccountSettings } from "@/components/dashboard/account-settings"
import { SectionCard } from "@/components/dashboard/section-card"
import { ROLE_META } from "@/lib/dashboard/navigation"
import { formatDateTime } from "@/lib/format"
import type { UserRole } from "@/lib/roles"
import type { AuthUser } from "@/types/user"
import { cn } from "@/lib/utils"

const CAPABILITIES: Record<UserRole, string[]> = {
  seeker: [
    "Browse and search published jobs",
    "Apply to jobs and track application status",
    "Save jobs, manage your profile and resume",
    "View interview invitations and notifications",
  ],
  recruiter: [
    "Create, edit, pause, and close job postings",
    "Review applicants and move them through the pipeline",
    "Schedule and manage interviews",
    "Maintain your company profile",
  ],
  admin: [
    "Manage every HireLoop account, role, and status",
    "Moderate jobs, applications, and reports",
    "Review platform analytics and growth",
    "Access all protected API endpoints",
  ],
}

export function SettingsView({
  user,
  role,
  connection,
}: {
  user: AuthUser
  role: UserRole
  connection: {
    ok: boolean
    status: number | null
    message: string
    baseUrl: string
  }
}) {
  const roleMeta = ROLE_META[role]
  const profileHref =
    role === "seeker"
      ? "/dashboard/seeker/profile"
      : role === "recruiter"
        ? "/dashboard/recruiter/company"
        : "/dashboard/admin/users"

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <SectionCard
        title="Account"
        description="Update your display name or password. Email changes require an administrator."
        className="xl:col-span-2"
      >
        <AccountSettings name={user.name} email={user.email} />
      </SectionCard>

      <div className="space-y-4">
        <SectionCard
          title="API connection"
          description="All business data is served by the Express API."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border",
                  connection.ok
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                )}
              >
                <Server className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                  {connection.ok ? (
                    <CheckCircle2
                      className="size-3.5 text-emerald-300"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="size-3.5 text-amber-300"
                      aria-hidden="true"
                    />
                  )}
                  {connection.ok ? "Reachable" : "Not reachable"}
                </p>
                <p className="text-[11px] text-white/35">
                  {connection.status
                    ? `HTTP ${connection.status}`
                    : "No response"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-black/20 p-2.5">
              <p className="text-[10px] font-medium tracking-[0.12em] text-white/25 uppercase">
                Base URL
              </p>
              <code className="mt-1 block truncate font-mono text-[11px] text-white/55">
                {connection.baseUrl}
              </code>
            </div>

            <p className="text-[11px] leading-relaxed text-white/35">
              {connection.message} Browser requests are proxied through Better
              Auth so signing secrets never reach the client.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Your workspace"
          description={`Signed in as ${roleMeta.label}.`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10 text-indigo-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-white">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-white/35">
                  {user.email}
                </p>
              </div>
            </div>

            <ul className="grid gap-1.5 text-[11px] text-white/45">
              {CAPABILITIES[role].map((capability) => (
                <li key={capability} className="flex items-start gap-1.5">
                  <CheckCircle2
                    className="mt-0.5 size-3 shrink-0 text-emerald-300/70"
                    aria-hidden="true"
                  />
                  {capability}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 border-t border-white/6 pt-3">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="h-7 border-white/10 bg-transparent text-[11px] text-white/70 hover:bg-white/[0.06] hover:text-white"
                render={
                  <Link href={profileHref}>
                    {role === "recruiter" ? (
                      <Building2 className="size-3" aria-hidden="true" />
                    ) : (
                      <UserRound className="size-3" aria-hidden="true" />
                    )}
                    Open profile
                  </Link>
                }
              />
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="h-7 border-white/10 bg-transparent text-[11px] text-white/70 hover:bg-white/[0.06] hover:text-white"
                render={
                  <Link href={`/dashboard/${role}/notifications`}>
                    <ExternalLink className="size-3" aria-hidden="true" />
                    Notifications
                  </Link>
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Session" description="Better Auth session details.">
          <dl className="grid gap-2 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/35">Role</dt>
              <dd className="text-white/65">{roleMeta.label}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/35">Status</dt>
              <dd className="text-emerald-300/80">{user.status}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/35">Email verified</dt>
              <dd className="text-white/65">
                {user.emailVerified ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/35">Account created</dt>
              <dd className="text-white/65">
                {formatDateTime(user.createdAt)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 flex items-start gap-1.5 border-t border-white/6 pt-3 text-[10px] leading-relaxed text-white/25">
            <KeyRound className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            Roles are stored in the database and verified on every server
            request. Changing the URL cannot change your role.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}
