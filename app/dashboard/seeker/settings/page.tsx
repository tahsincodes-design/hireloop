import type { Metadata } from "next"

import { SettingsPageView } from "@/components/dashboard/settings-page"

export const metadata: Metadata = {
  title: "Settings · HireLoop",
}

export default function SeekerSettingsPage() {
  return (
    <SettingsPageView
      eyebrow="Settings"
      title="Account & security"
      description="Manage your account details, password, and API connection."
    />
  )
}
