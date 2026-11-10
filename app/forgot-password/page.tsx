"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#05050a] px-4 pt-28 pb-16 text-white sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(99,102,241,0.28),transparent_70%)]"
      />

      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Sign In
          </Link>
        </div>

        <Card className="gap-0 rounded-3xl border border-white/10 bg-[#0a0a12]/85 p-6 shadow-2xl ring-0 shadow-black/50 backdrop-blur-xl sm:p-8">
          <CardHeader className="p-0 pb-6">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
              <KeyRound className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-manrope text-2xl font-bold tracking-tight text-white">
              Reset your password
            </CardTitle>
            <CardDescription className="text-sm text-white/50">
              Enter your account email and we will send you password reset
              instructions.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {submitted ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed">
                    If an account matches <strong>{email}</strong>, you will
                    receive a link to reset your password shortly.
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  className="w-full bg-[#6366f1] text-white hover:bg-[#5558e6]"
                  render={<Link href="/sign-in">Return to Sign In</Link>}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-white/70">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder:text-white/30 focus-visible:border-[#6366f1] focus-visible:ring-[#6366f1]/25 md:text-sm dark:bg-white/5"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-1 h-11 w-full rounded-xl bg-[#6366f1] text-sm font-medium text-white hover:bg-[#5558e6]"
                >
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="mt-6 border-t border-white/5 pt-4 text-center">
              <Link
                href="/"
                className="text-xs text-white/40 transition-colors hover:text-white"
              >
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
