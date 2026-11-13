import Stripe from "stripe"

/**
 * Stripe is configured through the single `.env` file.
 *
 * `STRIPE_SECRET_KEY` is server-only and must never be imported into a client
 * component. `STRIPE_RECRUITER_PRICE_ID` is optional: when it is missing the
 * default Price ID of the Recruiter Growth plan is used.
 */
let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env before starting checkout."
    )
  }

  stripeClient ??= new Stripe(secretKey)

  return stripeClient
}

export const STRIPE_PLANS = {
  recruiter:
    process.env.STRIPE_RECRUITER_PRICE_ID ?? "price_1Ub6p0CMfsEtjgYwkDIxO6zy",
} as const

export type StripePlan = keyof typeof STRIPE_PLANS

export function isStripePlan(value: unknown): value is StripePlan {
  return typeof value === "string" && value in STRIPE_PLANS
}
