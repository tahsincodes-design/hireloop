import { Building2, Mail, MapPin, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { formatDate } from "@/lib/format"
import type { PlatformUser } from "@/types/user"
import { cn } from "@/lib/utils"

export function CandidateCard({
  candidate,
  className,
}: {
  candidate: PlatformUser
  className?: string
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-white/8 bg-[#0b0b12] py-0 text-white ring-0 transition-colors hover:border-violet-400/25",
        className
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <UserAvatar name={candidate.name} image={candidate.image} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-manrope text-sm font-semibold text-white">
              {candidate.name}
            </h3>
            <p className="truncate text-[11px] text-white/40">
              {candidate.headline ?? "Candidate on HireLoop"}
            </p>
            <p className="mt-0.5 text-[10px] text-white/25">
              Joined {formatDate(candidate.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-1.5 text-[11px] text-white/45">
          <p className="flex items-center gap-1.5 truncate">
            <Mail
              className="size-3 shrink-0 text-white/25"
              aria-hidden="true"
            />
            <span className="truncate">{candidate.email}</span>
          </p>
          {candidate.location ? (
            <p className="flex items-center gap-1.5 truncate">
              <MapPin
                className="size-3 shrink-0 text-white/25"
                aria-hidden="true"
              />
              <span className="truncate">{candidate.location}</span>
            </p>
          ) : null}
          {candidate.companyName ? (
            <p className="flex items-center gap-1.5 truncate">
              <Building2
                className="size-3 shrink-0 text-white/25"
                aria-hidden="true"
              />
              <span className="truncate">{candidate.companyName}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-white/6 pt-3">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="h-8 flex-1 border-white/10 bg-transparent text-[12px] text-white/70 hover:bg-white/[0.06] hover:text-white"
            render={
              <a href={`mailto:${candidate.email}`}>
                <Mail className="size-3.5" aria-hidden="true" />
                Contact
              </a>
            }
          />
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">
            <UserRound className="size-2.5" aria-hidden="true" />
            Seeker
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
