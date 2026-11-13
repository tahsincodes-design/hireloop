import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getStripe } from "@/lib/stripe"
import { checkoutVerify } from "@/lib/actions/payment"

export const metadata: Metadata = {
  title: "Payment · HireLoop",
  description: "Your HireLoop payment status.",
  robots: { index: false, follow: false },
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const PLAN_LABELS: Record<string, string> = {
  recruiter: "Recruiter Growth",
}

function humanize(value: string | null | undefined) {
  if (!value) return "—"

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    throw new Error("Please provide a valid session_id (`cs_test_...`)")
  }

  const {
    status,
    payment_status,
    customer_email,
    customer_details,
    metadata,
    payment_intent,
    line_items,
    amount_total,
  } = await getStripe().checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  })

  // if (status === "open") {
  //   return redirect("/")
  // }

  // if (status === "complete" && payment_status === "paid") {
  //   // Save and update plan information in your database (HireLoop server)
  //   // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, { ... })
  // }

  const resolvedEmail = customer_email ?? customer_details?.email ?? null
  const metadataPlan = metadata?.plan
  const planName =
    (metadataPlan ? PLAN_LABELS[metadataPlan] : undefined) ??
    line_items?.data[0]?.description ??
    (metadataPlan ? humanize(metadataPlan) : "HireLoop plan")

  const paymentIntentId =
    typeof payment_intent === "string" ? payment_intent : payment_intent?.id
  const paymentIntentStatus =
    typeof payment_intent === "string" ? null : payment_intent?.status

  const isPaid =
    payment_status === "paid" || payment_status === "no_payment_required"
  const isConfirmed = status === "complete" && isPaid
  
  if (status === 'open'){
    return redirect('/')
  }

  if (status === 'complete' && payment_status === 'paid'){
    console.log({status, payment_status, customer_email, metadata, payment_intent})
    const result = await checkoutVerify(session_id)

    console.log(result)
  }
  return (
    <main className="min-h-svh bg-[#05050a] px-4 pt-28 pb-20 text-white sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]"
      />

      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl border border-white/10 bg-[#0a0a12]/80 p-8 text-center shadow-lg backdrop-blur-md">
          <div className="flex justify-center">
            {isConfirmed ? (
              <CheckCircle2
                className="size-14 text-emerald-400"
                aria-hidden="true"
              />
            ) : (
              <XCircle className="size-14 text-amber-400" aria-hidden="true" />
            )}
          </div>

          <h1 className="mt-5 font-manrope text-2xl font-extrabold tracking-tight sm:text-3xl">
            {isConfirmed ? "Payment confirmed" : "Payment not confirmed yet"}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/55">
            {isConfirmed
              ? "Thanks for subscribing to HireLoop. A receipt has been sent to your email and your plan is ready to use."
              : "We could not confirm a completed payment for this checkout. If you were charged, contact support with your receipt."}
          </p>

          <dl className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left text-xs">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/45">Status</dt>
              <dd className="font-medium text-white">{humanize(status)}</dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/45">Payment status</dt>
              <dd className="font-medium text-white">
                {humanize(payment_status)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/45">Plan</dt>
              <dd className="font-medium text-white">{planName}</dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/45">Amount</dt>
              <dd className="font-medium text-white">
                {typeof amount_total === "number"
                  ? currencyFormatter.format(amount_total / 100)
                  : "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/45">Email</dt>
              <dd className="max-w-[60%] truncate font-medium text-white">
                {resolvedEmail ?? "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/45">Payment intent</dt>
              <dd
                className="max-w-[60%] truncate font-mono text-[11px] text-white/80"
                title={paymentIntentId ?? undefined}
              >
                {paymentIntentId ?? "—"}
                {paymentIntentStatus
                  ? ` · ${humanize(paymentIntentStatus)}`
                  : ""}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              nativeButton={false}
              className="w-full bg-[#6366f1] text-white hover:bg-[#5558e6] sm:w-auto"
              render={
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <Button
              nativeButton={false}
              className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              render={<Link href="/pricing">Back to pricing</Link>}
            />
          </div>
        </div>
      </div>
    </main>
  )
}