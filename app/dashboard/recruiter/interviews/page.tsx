import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { InterviewActions } from "@/components/dashboard/interview-actions"
import { InterviewCard } from "@/components/dashboard/interview-card"
import { InterviewScheduleDialog } from "@/components/dashboard/interview-schedule-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { loadApplications, loadInterviews } from "@/lib/api/dashboard"
import { getUpcomingInterviews } from "@/lib/dashboard/stats"

export const metadata: Metadata = {
  title: "Interviews · HireLoop",
}

export default async function RecruiterInterviewsPage() {
  const [interviewsSection, applicationsSection] = await Promise.all([
    loadInterviews({ scope: "recruiter" }),
    loadApplications({ scope: "recruiter" }),
  ])

  const interviews = interviewsSection.data ?? []
  const applications = applicationsSection.data ?? []
  const upcoming = getUpcomingInterviews(interviews)
  const upcomingIds = new Set(upcoming.map((interview) => interview.id))
  const past = interviews
    .filter((interview) => !upcomingIds.has(interview.id))
    .sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
      return bTime - aTime
    })
  const failures = [
    interviewsSection.failure,
    applicationsSection.failure,
  ].filter((failure) => failure !== null)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Recruiting"
        title="Interview schedule"
        description="Book time with shortlisted candidates and keep every interview on track."
        actions={<InterviewScheduleDialog applications={applications} />}
      />

      {failures.length > 0 ? <ApiNotice failures={failures} /> : null}

      {interviewsSection.failure ? (
        <ErrorState failure={interviewsSection.failure} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No interviews scheduled"
          description="Shortlist a candidate and schedule your first interview."
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
                description="Schedule an interview to fill your calendar."
                compact
              />
            ) : (
              <div className="space-y-2">
                {upcoming.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    perspective="recruiter"
                    actions={<InterviewActions interview={interview} />}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Past & closed"
            description="Completed and cancelled interviews."
          >
            {past.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No past interviews"
                description="Completed interviews will be archived here."
                compact
              />
            ) : (
              <div className="space-y-2">
                {past.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    perspective="recruiter"
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
