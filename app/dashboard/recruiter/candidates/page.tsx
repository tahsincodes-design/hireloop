import type { Metadata } from "next"
import { UserSearch } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { CandidateCard } from "@/components/dashboard/candidate-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchForm } from "@/components/dashboard/search-form"
import { loadCandidates } from "@/lib/api/dashboard"
import {
  firstParam,
  type DashboardSearchParams,
} from "@/lib/dashboard/search-params"

export const metadata: Metadata = {
  title: "Candidates · HireLoop",
}

export default async function RecruiterCandidatesPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const params = await searchParams
  const query = firstParam(params.q)?.trim() ?? ""
  const section = await loadCandidates({
    search: query || undefined,
    limit: 24,
  })
  const candidates = section.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Talent"
        title="Candidate pool"
        description="Discover job seekers active on HireLoop. Contact details are only shown to recruiters."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <SearchForm
        action="/dashboard/recruiter/candidates"
        defaultValue={query}
        placeholder="Search candidates by name, headline, or location…"
        label="Search candidates"
      />

      <p className="text-[11px] text-white/35">
        {section.ok
          ? `${candidates.length} ${
              candidates.length === 1 ? "candidate" : "candidates"
            } found${query ? ` for “${query}”` : ""}`
          : "Candidate search is unavailable"}
      </p>

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title={query ? "No matching candidates" : "No candidates found"}
          description={
            query
              ? "Try a broader search term."
              : "Candidate profiles will appear here when the candidates endpoint returns data."
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  )
}
