import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth/auth-form"
import { getSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Sign In · HireLoop",
  description: "Sign in to your HireLoop account.",
}

export default async function SignInPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")

  return (
    <main className="min-h-svh bg-[#05050a]">
      <AuthForm mode="sign-in" />
    </main>
  )
}
