import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { JobForm } from "@/components/dashboard/job-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"

export const metadata: Metadata = {
  title: "Post a Job · HireLoop",
}

export default function RecruiterNewJobPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Recruiting"
        title="Post a new job"
        description="Publish a role to the HireLoop marketplace. All fields are validated before submission."
        actions={
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to jobs
          </Link>
        }
      />

      <SectionCard
        title="Job details"
        description="Candidates see this information on the job card and detail dialog."
      >
        <JobForm />
      </SectionCard>
    </div>
  )
}
