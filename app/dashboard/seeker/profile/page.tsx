import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardList, UserRound } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { SectionCard } from "@/components/dashboard/section-card"
import { Progress } from "@/components/ui/progress"
import { loadProfile } from "@/lib/api/dashboard"
import { requireSessionUser } from "@/lib/auth/session"
import { getProfileCompletion } from "@/lib/dashboard/stats"

export const metadata: Metadata = {
  title: "My Profile · HireLoop",
}

export default async function SeekerProfilePage() {
  const user = await requireSessionUser()
  const section = await loadProfile()
  const profile = section.data
  const completion = getProfileCompletion(profile, user.image)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Profile"
        title="Make your profile stand out"
        description="Recruiters see this information when you apply. Keep it accurate and complete."
        actions={
          <Link
            href="/dashboard/seeker/resume"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ClipboardList className="size-4" aria-hidden="true" />
            Manage resume
          </Link>
        }
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Profile details"
          description="Changes are saved through the Express API."
          className="xl:col-span-2"
        >
          {section.failure ? (
            <ErrorState failure={section.failure} className="mb-4" />
          ) : null}
          <ProfileForm
            profile={profile}
            userName={user.name}
            email={user.email}
          />
        </SectionCard>

        <SectionCard
          title="Profile strength"
          description="Complete every item to improve your match rate."
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-white/45">Completion</span>
                <span className="font-mono text-white/70 tabular-nums">
                  {section.ok ? `${completion.percentage}%` : "—"}
                </span>
              </div>
              <Progress
                value={section.ok ? completion.percentage : 0}
                className="[&_[data-slot=progress-indicator]]:bg-indigo-400 [&_[data-slot=progress-track]]:bg-white/8"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-medium tracking-[0.12em] text-white/25 uppercase">
                Completed
              </p>
              <ul className="grid gap-1.5 text-[11px] text-white/50">
                {completion.completed.length === 0 ? (
                  <li className="text-white/25">Nothing completed yet.</li>
                ) : (
                  completion.completed.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      {item}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-medium tracking-[0.12em] text-white/25 uppercase">
                Missing
              </p>
              <ul className="grid gap-1.5 text-[11px] text-white/40">
                {completion.missing.length === 0 ? (
                  <li className="text-emerald-300/70">
                    Your profile is complete.
                  </li>
                ) : (
                  completion.missing.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-400/70" />
                      {item}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <p className="border-t border-white/6 pt-3 text-[10px] leading-relaxed text-white/25">
              <UserRound
                className="mr-1 inline size-3 align-[-2px]"
                aria-hidden="true"
              />
              Profile data comes from{" "}
              <code className="font-mono">/profiles/me</code>. Job seekers can
              edit their own profile; recruiters cannot change it.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
