import { createHmac } from "node:crypto"
import { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { API_BASE_URL, API_TIMEOUT_MS } from "@/lib/api/config"
import { isUserRole, type UserRole } from "@/lib/roles"
import { isUserStatus } from "@/types/user"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_ROOTS = new Set([
  "users",
  "candidates",
  "jobs",
  "job",
  "applications",
  "saved-jobs",
  "interviews",
  "notifications",
  "profiles",
  "companies",
  "admin",
  "reports",
])

type AuthorizationResult =
  { allowed: true } | { allowed: false; reason: string }

function authorize(
  role: UserRole,
  method: string,
  segments: string[]
): AuthorizationResult {
  const [root, first, second] = segments

  if (!root || !ALLOWED_ROOTS.has(root)) {
    return { allowed: false, reason: "This API path is not exposed." }
  }

  if (root === "admin" || root === "reports") {
    return role === "admin"
      ? { allowed: true }
      : { allowed: false, reason: "Administrator access required." }
  }

  if (root === "users") {
    return role === "admin" && method === "GET"
      ? { allowed: true }
      : { allowed: false, reason: "Administrator access required." }
  }

  if (root === "candidates") {
    return role === "recruiter" || role === "admin"
      ? { allowed: true }
      : { allowed: false, reason: "Recruiter access required." }
  }

  if (root === "saved-jobs") {
    return role === "seeker"
      ? { allowed: true }
      : { allowed: false, reason: "Job seeker access required." }
  }

  if (root === "jobs" || root === "job") {
    if (method === "GET") return { allowed: true }
    return role === "recruiter" || role === "admin"
      ? { allowed: true }
      : { allowed: false, reason: "Recruiter access required." }
  }

  if (root === "applications") {
    if (method === "GET") return { allowed: true }
    if (method === "POST") {
      return role === "seeker"
        ? { allowed: true }
        : { allowed: false, reason: "Only job seekers can apply." }
    }
    return { allowed: true }
  }

  if (root === "profiles") {
    // `/profiles/me` and `/profiles/me/resume` are always scoped to the
    // authenticated user. Arbitrary profile IDs are admin-only.
    if (first === "me") return { allowed: true }
    return role === "admin"
      ? { allowed: true }
      : {
          allowed: false,
          reason: "Only administrators can view other profiles.",
        }
  }

  if (root === "companies") {
    if (method === "GET") return { allowed: true }
    return role === "recruiter" || role === "admin"
      ? { allowed: true }
      : { allowed: false, reason: "Recruiter access required." }
  }

  if (root === "interviews" || root === "notifications") {
    void first
    void second
    return { allowed: true }
  }

  return { allowed: false, reason: "This API operation is not permitted." }
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  const user = session?.user

  if (!user) return jsonError("Unauthorized.", 401)

  const role: UserRole = isUserRole(user.role) ? user.role : "seeker"
  const status = isUserStatus(user.status) ? user.status : "active"

  if (status === "suspended") {
    return jsonError("This account is suspended.", 403)
  }

  const { path } = await context.params
  const segments = path ?? []

  if (
    segments.some(
      (segment) =>
        !segment ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment === ".." ||
        segment === "."
    )
  ) {
    return jsonError("Invalid API path.", 400)
  }

  const authorization = authorize(role, request.method, segments)
  if (!authorization.allowed) {
    return jsonError(authorization.reason, 403)
  }

  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    return jsonError("Server auth secret is not configured.", 500)
  }

  const timestamp = Date.now().toString()
  const signature = createHmac("sha256", secret)
    .update(`${user.id}.${role}.${timestamp}`)
    .digest("hex")

  const pathname = segments.map(encodeURIComponent).join("/")
  const targetUrl = `${API_BASE_URL}/${pathname}${request.nextUrl.search}`

  const headers = new Headers({
    accept: "application/json",
    "x-hireloop-user-id": user.id,
    "x-hireloop-user-role": role,
    "x-hireloop-timestamp": timestamp,
    "x-hireloop-signature": signature,
    "x-hireloop-client": "hireloop-web",
  })

  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  let body: ArrayBuffer | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    const buffer = await request.arrayBuffer()
    if (buffer.byteLength > 0) body = buffer
  }

  let upstream: Response
  try {
    upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS + 3_000),
    })
  } catch {
    return jsonError(
      "Could not reach the HireLoop API. Check that the backend is running.",
      502
    )
  }

  const responseHeaders = new Headers({
    "cache-control": "no-store",
    "x-hireloop-proxy": "1",
  })

  const upstreamContentType = upstream.headers.get("content-type")
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType)
  }

  if (upstream.status === 204 || upstream.status === 205) {
    return new Response(null, {
      status: upstream.status,
      headers: responseHeaders,
    })
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const PUT = handle
export const DELETE = handle
