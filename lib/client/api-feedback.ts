import { toast } from "sonner"

import { ApiError } from "@/lib/api/types"

export function notifyApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      toast.error("Backend endpoint not available", {
        description: `${error.endpoint} has not been implemented by the Express API yet.`,
      })
      return
    }

    if (error.status === 401) {
      toast.error("Session expired", {
        description: "Sign in again to continue.",
      })
      return
    }

    if (error.status === 403) {
      toast.error("Not permitted", {
        description: error.message,
      })
      return
    }

    toast.error(error.message)
    return
  }

  toast.error(error instanceof Error ? error.message : fallback)
}

export function notifySuccess(message: string, description?: string) {
  toast.success(message, description ? { description } : undefined)
}
