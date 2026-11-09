"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Loader2, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import type { UserRole } from "@/lib/roles"

type AuthMode = "sign-in" | "sign-up"

const inputClass =
  "h-11 rounded-xl border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder:text-white/30 focus-visible:border-[#6366f1] focus-visible:ring-[#6366f1]/25 dark:bg-white/5 md:text-sm"

const linkClass =
  "font-medium text-[#8b8bff] underline-offset-4 transition-colors hover:text-white hover:underline"

const COPY = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to keep your job search moving.",
    submit: "Sign In",
    switchLabel: "New to HireLoop?",
    switchCta: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    title: "Create your account",
    description: "Start matching with world-class companies in minutes.",
    submit: "Create Account",
    switchLabel: "Already have an account?",
    switchCta: "Sign in",
    switchHref: "/sign-in",
  },
} as const

const ROLES = [
  { value: "seeker", label: "Job Seeker", icon: UserRound },
  { value: "recruiter", label: "Recruiter", icon: Building2 },
  { value: "admin", label: "Admin", icon: ShieldCheck },
] as const

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password. Please try again.",
  INVALID_EMAIL: "That email address doesn't look right.",
  USER_ALREADY_EXISTS:
    "An account with this email already exists. Try signing in.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "An account with this email already exists. Try signing in.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
  PASSWORD_TOO_LONG: "That password is too long.",
  INVALID_ADMIN_INVITE: "A valid admin invite code is required.",
}

function getAuthErrorMessage(error: { code?: string; message?: string }) {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code]
  }

  return error.message || "Something went wrong. Please try again."
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode]
  const isSignUp = mode === "sign-up"
  const router = useRouter()

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>("seeker")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pending) return

    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const rememberMe = formData.get("rememberMe") === "on"

    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    setPending(true)

    try {
      if (isSignUp) {
        const name = String(formData.get("name") ?? "").trim()
        const confirmPassword = String(formData.get("confirmPassword") ?? "")
        const role = selectedRole
        const adminInviteCode = String(
          formData.get("adminInviteCode") ?? ""
        ).trim()

        if (!name) {
          setError("Please enter your full name.")
          return
        }

        if (password.length < 8) {
          setError("Password must be at least 8 characters long.")
          return
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.")
          return
        }

        const response = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            ...(role === "admin" ? { adminInviteCode } : {}),
          }),
        })

        if (!response.ok) {
          const result: unknown = await response.json()
          const responseError = isRecord(result)
            ? {
                code: typeof result.code === "string" ? result.code : undefined,
                message:
                  typeof result.message === "string"
                    ? result.message
                    : undefined,
              }
            : {}

          setError(getAuthErrorMessage(responseError))
          return
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          rememberMe,
        })

        if (signInError) {
          setError(getAuthErrorMessage(signInError))
          return
        }
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#05050a] px-4 pt-28 pb-16 text-white sm:px-6">
      {/* Ambient theme glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(99,102,241,0.28),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-40 -z-10 flex justify-center opacity-40"
      >
        <Image
          src="/images/hero-globe.png"
          alt=""
          width={1440}
          height={1202}
          className="w-[900px] max-w-none shrink-0 select-none sm:w-[1200px]"
        />
      </div>

      <div className="w-full max-w-md">
        <Card className="gap-0 rounded-3xl border border-white/10 bg-[#0a0a12]/85 py-0 shadow-2xl ring-0 shadow-black/50 backdrop-blur-xl">
          <CardHeader className="p-6 pb-0 sm:p-8 sm:pb-0">
            <CardTitle className="font-manrope text-2xl font-bold tracking-tight text-white">
              {copy.title}
            </CardTitle>
            <CardDescription className="text-sm text-white/50">
              {copy.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {/* Mode toggle */}
            <nav
              aria-label="Authentication mode"
              className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1"
            >
              {(
                [
                  { label: "Sign In", href: "/sign-in", value: "sign-in" },
                  { label: "Sign Up", href: "/sign-up", value: "sign-up" },
                ] as const
              ).map((tab) => {
                const active = tab.value === mode
                return (
                  <Link
                    key={tab.value}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-full bg-[#6366f1] px-4 py-2 text-center text-sm font-medium text-white shadow-sm"
                        : "rounded-full px-4 py-2 text-center text-sm font-medium text-white/55 transition-colors hover:text-white"
                    }
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </nav>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate={false}
              aria-busy={pending}
            >
              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-white/70">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    required
                    className={inputClass}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-white/70">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-white/70">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
                  minLength={isSignUp ? 8 : undefined}
                  aria-describedby={isSignUp ? "password-hint" : undefined}
                  required
                  className={inputClass}
                />
                {isSignUp && (
                  <p id="password-hint" className="text-xs text-white/35">
                    Must be at least 8 characters.
                  </p>
                )}
              </div>

              {isSignUp && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password" className="text-white/70">
                      Confirm password
                    </Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      minLength={8}
                      required
                      className={inputClass}
                    />
                  </div>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-medium text-white/70">
                      I&apos;m joining as
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((role) => (
                        <label
                          key={role.value}
                          className="relative cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={selectedRole === role.value}
                            onChange={() => setSelectedRole(role.value)}
                            className="peer sr-only"
                          />
                          <span className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 transition-colors peer-checked:border-[#6366f1]/60 peer-checked:bg-[#6366f1]/15 peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-[#6366f1]/30">
                            <role.icon className="size-4" aria-hidden="true" />
                            {role.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {selectedRole === "admin" && (
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="admin-invite-code"
                        className="text-white/70"
                      >
                        Admin invite code
                      </Label>
                      <Input
                        id="admin-invite-code"
                        name="adminInviteCode"
                        type="password"
                        autoComplete="off"
                        required
                        className={inputClass}
                      />
                      <p className="text-xs text-white/35">
                        Admin signup requires an invite code.
                      </p>
                    </div>
                  )}
                </>
              )}

              {isSignUp ? (
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    id="terms"
                    name="terms"
                    required
                    className="mt-0.5 border-white/20 data-checked:border-[#6366f1] data-checked:bg-[#6366f1]"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs leading-relaxed font-normal text-white/50"
                  >
                    I agree to HireLoop&apos;s{" "}
                    <Link href="/terms" className={linkClass}>
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className={linkClass}>
                      Privacy Policy
                    </Link>
                    .
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      className="border-white/20 data-checked:border-[#6366f1] data-checked:bg-[#6366f1]"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-xs font-normal text-white/50"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#8b8bff] underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="mt-1 h-11 w-full rounded-xl bg-[#6366f1] text-sm font-medium text-white hover:bg-[#5558e6] disabled:opacity-70"
              >
                {pending ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    {isSignUp ? "Creating account…" : "Signing in…"}
                  </>
                ) : (
                  copy.submit
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-white/40 sm:text-sm">
              {copy.switchLabel}{" "}
              <Link href={copy.switchHref} className={linkClass}>
                {copy.switchCta}
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs text-white/30">
          {isSignUp
            ? "Free forever · No credit card required"
            : "Secure sign-in powered by Better Auth"}
        </p>
      </div>
    </section>
  )
}
