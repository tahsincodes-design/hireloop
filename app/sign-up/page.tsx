import type { Metadata } from "next"

import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Create Account · HireLoop",
  description: "Create your HireLoop account as a job seeker or recruiter.",
}

export default function SignUpPage() {
  return (
    <main className="min-h-svh bg-[#05050a]">
      <AuthForm mode="sign-up" />
    </main>
  )
}
