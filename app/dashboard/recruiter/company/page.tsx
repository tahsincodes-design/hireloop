import type { Metadata } from "next"

import { ApiNotice } from "@/components/dashboard/api-notice"
import { CompanyForm } from "@/components/dashboard/company-form"
import { ErrorState } from "@/components/dashboard/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { loadCompany } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Company Profile · HireLoop",
}

export default async function RecruiterCompanyPage() {
  const section = await loadCompany()

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Company profile"
        description="Candidates see these details on every job you publish."
      />

      {section.failure ? <ApiNotice failures={[section.failure]} /> : null}

      <SectionCard
        title="Company details"
        description="Changes are saved through the Express API."
      >
        {section.failure ? (
          <ErrorState failure={section.failure} className="mb-4" />
        ) : null}
        <CompanyForm company={section.data} />
      </SectionCard>
    </div>
  )
}
