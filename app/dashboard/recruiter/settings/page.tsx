import type { Metadata } from "next"

import { SettingsPageView } from "@/components/dashboard/settings-page"

export const metadata: Metadata = {
  title: "Settings · HireLoop",
}

export default function RecruiterSettingsPage() {
  return (
    <SettingsPageView
      eyebrow="Settings"
      title="Account & security"
      description="Manage your recruiter account, password, and API connection."
    />
  )
}
