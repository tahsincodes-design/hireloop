export type ApiErrorKind =
  | "http"
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "invalid_response"
  | "server"

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly endpoint: string
  readonly code: string | null
  readonly details: unknown

  constructor(
    message: string,
    options: {
      kind: ApiErrorKind
      status?: number | null
      endpoint: string
      code?: string | null
      details?: unknown
      cause?: unknown
    }
  ) {
    super(message, { cause: options.cause })
    this.name = "ApiError"
    this.kind = options.kind
    this.status = options.status ?? null
    this.endpoint = options.endpoint
    this.code = options.code ?? null
    this.details = options.details
  }
}

export type ApiFailure = {
  /** Stable key used by the dashboard UI, e.g. `applications`. */
  key: string
  endpoint: string
  status: number | null
  kind: ApiErrorKind
  message: string
  /** True when the backend answered 404 for a contract endpoint. */
  unavailable: boolean
  requiredEndpoint: string
}

export type QueryValue = string | number | boolean | null | undefined

export type QueryParams = Record<string, QueryValue>

export function toApiFailure(
  key: string,
  endpoint: string,
  error: unknown
): ApiFailure {
  if (error instanceof ApiError) {
    return {
      key,
      endpoint: error.endpoint,
      status: error.status,
      kind: error.kind,
      message: error.message,
      unavailable: error.status === 404,
      requiredEndpoint: `${endpoint}`,
    }
  }

  return {
    key,
    endpoint,
    status: null,
    kind: "network",
    message:
      error instanceof Error ? error.message : "Unexpected API client error.",
    unavailable: false,
    requiredEndpoint: endpoint,
  }
}
