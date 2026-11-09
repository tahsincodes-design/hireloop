"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Loader2, LogOut, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { notifySuccess } from "@/lib/client/api-feedback"

const fieldClass =
  "border-white/10 bg-black/20 text-white placeholder:text-white/25 focus-visible:border-indigo-400/40 focus-visible:ring-indigo-400/15 dark:bg-black/20"

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message
    }
  }
  return fallback
}

export function AccountSettings({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const router = useRouter()
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authClient.signOut()
      router.push("/sign-in")
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  async function updateName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingName) return

    setNameError(null)
    const formData = new FormData(event.currentTarget)
    const nextName = String(formData.get("name") ?? "").trim()

    if (nextName.length < 2) {
      setNameError("Please enter your full name.")
      return
    }

    setSavingName(true)

    try {
      const result = await authClient.updateUser({ name: nextName })
      if (result.error) {
        setNameError(errorMessage(result.error, "Could not update your name."))
        return
      }
      notifySuccess("Account updated", "Your display name has been changed.")
      router.refresh()
    } catch (error) {
      setNameError(errorMessage(error, "Could not update your name."))
    } finally {
      setSavingName(false)
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingPassword) return

    setPasswordError(null)
    setPasswordSuccess(null)
    const formData = new FormData(event.currentTarget)
    const currentPassword = String(formData.get("currentPassword") ?? "")
    const newPassword = String(formData.get("newPassword") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }

    setSavingPassword(true)

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })

      if (result.error) {
        setPasswordError(
          errorMessage(result.error, "Could not change your password.")
        )
        return
      }

      setPasswordSuccess(
        "Password updated. Other sessions have been signed out."
      )
      notifySuccess("Password changed")
      event.currentTarget.reset()
    } catch (error) {
      setPasswordError(errorMessage(error, "Could not change your password."))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={updateName} className="space-y-3" aria-busy={savingName}>
        <div className="space-y-1.5">
          <Label htmlFor="account-name" className="text-xs text-white/60">
            Display name
          </Label>
          <Input
            id="account-name"
            name="name"
            defaultValue={name}
            required
            minLength={2}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="account-email" className="text-xs text-white/60">
            Email
          </Label>
          <Input
            id="account-email"
            value={email}
            readOnly
            disabled
            className={fieldClass}
          />
          <p className="text-[11px] text-white/30">
            Contact an administrator to change your email address.
          </p>
        </div>

        {nameError ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-200"
          >
            {nameError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="sm"
          disabled={savingName}
          className="bg-indigo-500 text-white hover:bg-indigo-400"
        >
          {savingName ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <UserRound className="size-3.5" aria-hidden="true" />
          )}
          Save name
        </Button>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-3"
        aria-busy={savingPassword}
      >
        <div className="space-y-1.5">
          <Label htmlFor="current-password" className="text-xs text-white/60">
            Current password
          </Label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs text-white/60">
              New password
            </Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-new-password"
              className="text-xs text-white/60"
            >
              Confirm password
            </Label>
            <Input
              id="confirm-new-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={fieldClass}
            />
          </div>
        </div>

        {passwordError ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-200"
          >
            {passwordError}
          </p>
        ) : null}
        {passwordSuccess ? (
          <p
            role="status"
            className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-200"
          >
            {passwordSuccess}
          </p>
        ) : null}

        <Button
          type="submit"
          size="sm"
          disabled={savingPassword}
          className="bg-indigo-500 text-white hover:bg-indigo-400"
        >
          {savingPassword ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="size-3.5" aria-hidden="true" />
          )}
          Change password
        </Button>
      </form>

      <div className="lg:col-span-2">
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          disabled={signingOut}
          className="border-rose-400/20 bg-transparent text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
        >
          {signingOut ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="size-3.5" aria-hidden="true" />
          )}
          Sign out from this device
        </Button>
      </div>
    </div>
  )
}
