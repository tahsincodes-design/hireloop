import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { getStripe, isStripePlan, STRIPE_PLANS } from "@/lib/stripe"
import { getSession } from "@/lib/core/server"

/**
 * Creates a Stripe Checkout Session for a plan and returns its hosted URL.
 *
 * The browser never sees the Price IDs: it only sends the plan name, and the
 * Price ID is resolved on the server from `lib/stripe.ts`.
 */
export async function POST(request: Request) {
  try {
    const userSession = await getSession()

    const body = (await request.json().catch(() => ({}))) as {
      plan?: unknown
    }

    if (!isStripePlan(body.plan)) {
      return NextResponse.json(
        { error: "Unknown plan. Choose a valid plan and try again." },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const priceId = STRIPE_PLANS[body.plan]
    const price = await stripe.prices.retrieve(priceId)

    const headersList = await headers()
    const origin = headersList.get("origin") ?? new URL(request.url).origin

    const metadata: Record<string, string> = { plan: body.plan }
    if (userSession?.user.id) {
      metadata.userId = userSession.user.id
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      // Recurring prices must use subscription mode, one-time prices payment.
      mode: price.recurring ? "subscription" : "payment",
      customer_email: userSession?.user.email,
      // Surfaced on the success page so the purchased plan survives the redirect.
      metadata,
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    })

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.")
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error("Failed to create Stripe Checkout Session:", error)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
