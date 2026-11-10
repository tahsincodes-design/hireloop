import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy · HireLoop",
  description: "HireLoop privacy policy and data protection information.",
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-white/40">
          Last updated: November 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/60">
          <section>
            <h2 className="text-base font-semibold text-white">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              We collect information you provide directly to us when you create
              an account, update your profile, submit resumes, or communicate
              with recruiters through HireLoop.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">
              2. How We Use Information
            </h2>
            <p className="mt-2">
              We use information collected to facilitate connections between job
              seekers and employers, improve our recommendations, and ensure
              platform security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">
              3. Data Security
            </h2>
            <p className="mt-2">
              We implement industry-standard cryptographic practices and access
              controls to protect your personal data from unauthorized access,
              alteration, disclosure, or destruction.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
