import type { Metadata } from "next"

import { SettingsPageView } from "@/components/dashboard/settings-page"

export const metadata: Metadata = {
  title: "Settings · HireLoop",
}

export default function AdminSettingsPage() {
  return (
    <SettingsPageView
      eyebrow="Account"
      title="Administrator settings"
      description="Manage your admin account, security, and API connection."
    />
  )
}
