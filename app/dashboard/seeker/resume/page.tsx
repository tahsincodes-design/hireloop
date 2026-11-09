import type { Metadata } from "next"
import { ClipboardList } from "lucide-react"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { ResumeUpload } from "@/components/dashboard/resume-upload"
import { SectionCard } from "@/components/dashboard/section-card"
import { loadProfile } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Resume / CV · HireLoop",
}

export default async function SeekerResumePage() {
  const section = await loadProfile()

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resume / CV"
        title="Manage your resume"
        description="Upload the latest version of your CV. It is attached to every application you submit."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Resume file"
          description="PDF, DOC, or DOCX · maximum 5 MB."
          className="xl:col-span-2"
        >
          {section.failure ? (
            <ErrorState failure={section.failure} className="mb-4" />
          ) : null}
          <ResumeUpload profile={section.data} />
        </SectionCard>

        <SectionCard title="Why upload a resume?">
          <ul className="space-y-2.5 text-[11px] leading-relaxed text-white/45">
            <li className="flex items-start gap-2">
              <ClipboardList
                className="mt-0.5 size-3.5 shrink-0 text-indigo-300"
                aria-hidden="true"
              />
              Recruiters can download your CV directly from an application.
            </li>
            <li className="flex items-start gap-2">
              <ClipboardList
                className="mt-0.5 size-3.5 shrink-0 text-indigo-300"
                aria-hidden="true"
              />
              Keep one current file so every new application uses the same
              version.
            </li>
            <li className="flex items-start gap-2">
              <ClipboardList
                className="mt-0.5 size-3.5 shrink-0 text-indigo-300"
                aria-hidden="true"
              />
              Files are served by the Express API and never embedded in the
              browser bundle.
            </li>
          </ul>
          <p className="mt-3 border-t border-white/6 pt-3 text-[10px] leading-relaxed text-white/25">
            Uploads use{" "}
            <code className="font-mono">POST /profiles/me/resume</code>. If the
            endpoint is unavailable, the page will report it instead of
            pretending the upload succeeded.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}
