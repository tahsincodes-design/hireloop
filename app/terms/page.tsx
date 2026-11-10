import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service · HireLoop",
  description: "HireLoop terms of service and usage conditions.",
}

export default function TermsPage() {
  return (
    <main className="min-h-svh bg-[#05050a] px-4 pt-28 pb-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="font-manrope text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-white/40">
          Last updated: November 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/60">
          <section>
            <h2 className="text-base font-semibold text-white">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using HireLoop, you agree to be bound by these
              Terms of Service and all applicable laws and regulations. If you
              do not agree with any of these terms, you are prohibited from
              using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">
              2. User Accounts and Responsibilities
            </h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your
              account and password and for restricting access to your computer.
              You agree to accept responsibility for all activities that occur
              under your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">
              3. Platform Conduct
            </h2>
            <p className="mt-2">
              Users agree not to submit fraudulent job applications, inaccurate
              job listings, or misleading profile details. HireLoop reserves the
              right to suspend or terminate accounts that violate community
              guidelines.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
