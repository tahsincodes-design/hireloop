"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PayButtonProps = {
  plan: string
  children: React.ReactNode
  className?: string
}

/**
 * Starts a Stripe Checkout Session and sends the browser to Stripe's hosted
 * checkout page. The Price ID stays on the server; only the plan name is sent.
 */
export function PayButton({ plan, children, className }: PayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const data = (await response.json().catch(() => null)) as {
        url?: string
        error?: string
      } | null

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Unable to start checkout.")
      }

      window.location.assign(data.url)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form action="/api/checkout_sessions" method="POST">
        <section>
          <Button
            type="submit"
            role="link"
            onClick={handleCheckout}
            disabled={isLoading}
            className={cn("w-full", className)}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Redirecting to Stripe…
              </>
            ) : (
              children
            )}
          </Button>
        </section>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
