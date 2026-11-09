import { createHmac } from "node:crypto"

import {
  apiRequest,
  type ApiMethod,
  type ApiRequestOptions,
} from "@/lib/api/client"
import { ApiError } from "@/lib/api/types"
import { getSessionUser } from "@/lib/auth/session"

/**
 * Builds a short-lived HMAC identity envelope for the Express API.
 *
 * The browser never sees these headers: all browser traffic goes through
 * `/api/backend/*`, which validates the Better Auth session and signs the
 * upstream request. Express must verify this signature (see
 * docs/BACKEND_API_CONTRACT.md) and enforce permissions/ownership itself.
 */
async function getSignedIdentityHeaders(): Promise<HeadersInit> {
  const user = await getSessionUser()

  if (!user) {
    throw new ApiError("Sign in to access this resource.", {
      kind: "unauthorized",
      status: 401,
      endpoint: "session",
    })
  }

  if (user.status === "suspended") {
    throw new ApiError("This account is suspended.", {
      kind: "forbidden",
      status: 403,
      endpoint: "session",
    })
  }

  const secret = process.env.BETTER_AUTH_SECRET

  if (!secret) {
    throw new ApiError(
      "BETTER_AUTH_SECRET is not configured, so API identity cannot be signed.",
      { kind: "server", status: 500, endpoint: "session" }
    )
  }

  const timestamp = Date.now().toString()
  const signature = createHmac("sha256", secret)
    .update(`${user.id}.${user.role}.${timestamp}`)
    .digest("hex")

  return {
    "x-hireloop-user-id": user.id,
    "x-hireloop-user-role": user.role,
    "x-hireloop-timestamp": timestamp,
    "x-hireloop-signature": signature,
    "x-hireloop-client": "hireloop-web",
  }
}

async function serverRequest<T>(
  method: ApiMethod,
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const authHeaders = await getSignedIdentityHeaders()
  return apiRequest<T>(method, path, {
    ...options,
    authHeaders,
    cache: "no-store",
  })
}

export const serverApi = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return serverRequest<T>("GET", path, options)
  },
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return serverRequest<T>("POST", path, { ...options, body })
  },
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return serverRequest<T>("PATCH", path, { ...options, body })
  },
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return serverRequest<T>("PUT", path, { ...options, body })
  },
  delete<T>(path: string, options?: ApiRequestOptions) {
    return serverRequest<T>("DELETE", path, options)
  },
}
