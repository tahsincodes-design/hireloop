import {
  API_BASE_URL,
  API_PROXY_BASE_PATH,
  API_TIMEOUT_MS,
} from "@/lib/api/config"
import { isRecord } from "@/lib/api/normalize"
import { ApiError, type ApiErrorKind, type QueryParams } from "@/lib/api/types"

export type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export type ApiRequestOptions = {
  query?: QueryParams
  headers?: HeadersInit
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
  cache?: RequestCache
  /**
   * Call a same-origin Next.js route (for example `/api/admin/users/:id`)
   * instead of the Express proxy. Browser-only; server code should use
   * `serverApi`.
   */
  sameOrigin?: boolean
  /**
   * Signed identity headers. Only supplied by `serverApi`; the browser proxy
   * derives identity from the Better Auth session cookie instead.
   */
  authHeaders?: HeadersInit
}

function buildPath(path: string, query?: QueryParams) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  if (!query) return normalizedPath

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }

  const queryString = params.toString()
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath
}

function resolveUrl(pathWithQuery: string, sameOrigin = false) {
  if (sameOrigin) {
    if (typeof window === "undefined") {
      throw new ApiError("Same-origin API calls can only run in the browser.", {
        kind: "server",
        endpoint: pathWithQuery,
      })
    }
    return pathWithQuery
  }

  if (typeof window === "undefined") {
    return `${API_BASE_URL}${pathWithQuery}`
  }

  return `${API_PROXY_BASE_PATH}${pathWithQuery}`
}

function isBodyInit(value: unknown): value is BodyInit {
  if (typeof FormData !== "undefined" && value instanceof FormData) return true
  if (typeof Blob !== "undefined" && value instanceof Blob) return true
  if (
    typeof URLSearchParams !== "undefined" &&
    value instanceof URLSearchParams
  ) {
    return true
  }
  if (value instanceof ArrayBuffer) return true
  if (ArrayBuffer.isView(value)) return true
  return typeof value === "string"
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined
  if (isBodyInit(body)) return body

  headers.set("content-type", "application/json")
  return JSON.stringify(body)
}

function statusToKind(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized"
  if (status === 403) return "forbidden"
  if (status === 404) return "not_found"
  if (status >= 500) return "server"
  return "http"
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (isRecord(payload)) {
    const message =
      payload.message ?? payload.error ?? payload.detail ?? payload.title
    if (typeof message === "string" && message.trim().length) return message
  }

  if (typeof payload === "string" && payload.trim().length < 500) {
    return payload.trim()
  }

  return fallback
}

async function parseResponse(response: Response) {
  if (response.status === 204 || response.status === 205) return null

  const text = await response.text()
  if (!text.trim()) return null

  const contentType = response.headers.get("content-type") ?? ""
  const looksLikeJson =
    contentType.includes("application/json") ||
    text.trimStart().startsWith("{") ||
    text.trimStart().startsWith("[")

  if (!looksLikeJson) return text

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError("The API returned malformed JSON.", {
      kind: "invalid_response",
      status: response.status,
      endpoint: response.url,
    })
  }
}

export async function apiRequest<T>(
  method: ApiMethod,
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const pathWithQuery = buildPath(path, options.query)
  const url = resolveUrl(pathWithQuery, options.sameOrigin)
  const headers = new Headers(options.authHeaders)

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) =>
      headers.set(key, value)
    )
  }

  headers.set("accept", "application/json")

  const body = serializeBody(options.body, headers)
  const timeoutMs = options.timeoutMs ?? API_TIMEOUT_MS
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal

  let response: Response

  try {
    response = await fetch(url, {
      method,
      headers,
      body,
      signal,
      cache: options.cache ?? "no-store",
      credentials: typeof window === "undefined" ? "same-origin" : "include",
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        `The API request timed out after ${Math.round(timeoutMs / 1000)}s.`,
        {
          kind: "timeout",
          endpoint: path,
          cause: error,
        }
      )
    }

    throw new ApiError(
      "Could not reach the HireLoop API. Check that the server is running.",
      {
        kind: "network",
        endpoint: path,
        cause: error,
      }
    )
  }

  const payload = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(
        payload,
        `The API responded with ${response.status} ${response.statusText}.`
      ),
      {
        kind: statusToKind(response.status),
        status: response.status,
        endpoint: path,
        code:
          isRecord(payload) && typeof payload.code === "string"
            ? payload.code
            : null,
        details: payload,
      }
    )
  }

  return payload as T
}

export const api = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return apiRequest<T>("GET", path, options)
  },
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiRequest<T>("POST", path, { ...options, body })
  },
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiRequest<T>("PATCH", path, { ...options, body })
  },
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiRequest<T>("PUT", path, { ...options, body })
  },
  delete<T>(path: string, options?: ApiRequestOptions) {
    return apiRequest<T>("DELETE", path, options)
  },
}
