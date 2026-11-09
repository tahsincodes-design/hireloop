/**
 * Central API configuration.
 *
 * `NEXT_PUBLIC_API_BASE_URL` is the only place the Express API origin is
 * configured. Leave it blank locally and the client falls back to the local
 * development server. Trailing slashes are removed so requests never contain
 * duplicate slashes.
 */
const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

export const API_BASE_URL = (
  configuredBaseUrl?.length ? configuredBaseUrl : "http://localhost:5000"
).replace(/\/+$/, "")

/** Same-origin Next.js proxy used by browser requests. */
export const API_PROXY_BASE_PATH = "/api/backend"

export const API_TIMEOUT_MS = 12_000
