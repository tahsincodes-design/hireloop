import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { InterviewCard } from "@/components/dashboard/interview-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { loadInterviews } from "@/lib/api/dashboard"
import { getUpcomingInterviews } from "@/lib/dashboard/stats"

export const metadata: Metadata = {
  title: "Interviews · HireLoop",
}

export default async function SeekerInterviewsPage() {
  const section = await loadInterviews({ scope: "mine" })
  const interviews = section.data ?? []
  const upcoming = getUpcomingInterviews(interviews)
  const upcomingIds = new Set(upcoming.map((interview) => interview.id))
  const past = interviews
    .filter((interview) => !upcomingIds.has(interview.id))
    .sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
      return bTime - aTime
    })

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Interviews"
        title="Your interview schedule"
        description="Confirm times, join meeting links, and keep track of past conversations."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      {section.failure ? (
        <ErrorState failure={section.failure} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No interviews scheduled"
          description="When a recruiter invites you to interview, the details will appear here."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Upcoming"
            description={`${upcoming.length} scheduled ${upcoming.length === 1 ? "interview" : "interviews"}.`}
          >
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing coming up"
                description="Your next interview will appear here."
                compact
              />
            ) : (
              <div className="space-y-2">
                {upcoming.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Past & closed"
            description="Completed, cancelled, and previous interviews."
          >
            {past.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No past interviews"
                description="Past interviews will be archived here."
                compact
              />
            ) : (
              <div className="space-y-2">
                {past.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
