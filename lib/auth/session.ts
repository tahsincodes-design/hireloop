import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { isUserRole, type UserRole } from "@/lib/roles"
import { isUserStatus } from "@/types/user"
import type { AuthUser } from "@/types/user"

function toIsoString(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string" && value.length) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }
  return null
}

/**
 * Server-only access to the Better Auth session. The role is always read from
 * the database-backed user record — never from client state, URLs or storage.
 */
export const getSessionUser = cache(async (): Promise<AuthUser | null> => {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user) return null

  const user = session.user
  const role: UserRole = isUserRole(user.role) ? user.role : "seeker"

  return {
    id: user.id,
    name: user.name?.trim() || user.email,
    email: user.email,
    image: user.image ?? null,
    role,
    status: isUserStatus(user.status) ? user.status : "active",
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
    emailVerified: Boolean(user.emailVerified),
  }
})

export async function requireSessionUser(): Promise<AuthUser> {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  return user
}

export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireSessionUser()
  if (user.role !== role) redirect("/dashboard")
  return user
}

export function isRole(user: AuthUser, role: UserRole) {
  return user.role === role
}
