"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, ShieldOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SuspendedNotice({ email }: { email: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    if (pending) return
    setPending(true)
    try {
      await authClient.signOut()
      router.push("/sign-in")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#05050a] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-rose-400/20 bg-[#0b0b12] p-6 text-center shadow-2xl shadow-black/50">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
          <ShieldOff className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-manrope text-xl font-semibold text-white">
          Account suspended
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/45">
          The HireLoop account for{" "}
          <span className="text-white/70">{email}</span> has been suspended by
          an administrator. Dashboard and API access are disabled.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-white/30">
          Contact your platform administrator if you believe this is a mistake.
        </p>
        <Button
          onClick={signOut}
          disabled={pending}
          className="mt-5 bg-indigo-500 text-white hover:bg-indigo-400"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="size-4" aria-hidden="true" />
          )}
          {pending ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </main>
  )
}
