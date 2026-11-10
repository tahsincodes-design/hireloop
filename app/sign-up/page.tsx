import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth/auth-form"
import { getSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Create Account · HireLoop",
  description: "Create your HireLoop account as a job seeker or recruiter.",
}

export default async function SignUpPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")

  return (
    <main className="min-h-svh bg-[#05050a]">
      <AuthForm mode="sign-up" />
    </main>
  )
}
