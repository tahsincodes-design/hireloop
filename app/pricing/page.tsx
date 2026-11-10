import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Check, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pricing · HireLoop",
  description: "Simple, transparent pricing for job seekers and hiring teams.",
}

const TIERS = [
  {
    name: "Job Seeker Free",
    description: "Everything you need to discover and apply to top jobs.",
    price: "$0",
    period: "forever",
    featured: false,
    cta: "Get Started Free",
    href: "/sign-up",
    features: [
      "Unlimited job browsing and search",
      "Save up to 50 active jobs",
      "Track application statuses in real-time",
      "Resume and profile builder",
      "Interview calendar notifications",
    ],
  },
  {
    name: "Recruiter Growth",
    description: "Empower your team to hire the best talent faster.",
    price: "$99",
    period: "per month",
    featured: true,
    cta: "Start 14-Day Free Trial",
    href: "/sign-up",
    features: [
      "Post up to 10 active job listings",
      "Unlimited candidate applications review",
      "Interactive hiring pipeline board",
      "Direct interview scheduling with candidates",
      "Company branding profile page",
      "Email & in-app notifications",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Custom solutions for large organizations and recruiting agencies.",
    price: "Custom",
    period: "tailored plans",
    featured: false,
    cta: "Contact Sales",
    href: "/sign-in",
    features: [
      "Unlimited job listings & team members",
      "Dedicated recruitment account manager",
      "Custom ATS and webhook integrations",
      "Advanced platform analytics & reporting",
      "Priority candidate recommendation engine",
      "99.9% SLA & dedicated support",
    ],
  },
] as const

export default function PricingPage() {
  return (
    <main className="min-h-svh bg-[#05050a] px-4 pt-28 pb-20 text-white sm:px-6 lg:px-8">
      {/* Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="h-auto gap-2 rounded-full border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase backdrop-blur-sm sm:text-[11px]"
          >
            <Sparkles className="size-3 text-[#f97316]" aria-hidden="true" />
            Flexible Plans
          </Badge>

          <h1 className="mt-4 font-manrope text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Transparent Pricing for Everyone
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Whether you are taking the next step in your career or building a
            high-performing team, HireLoop has a plan that scales with you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.featured
                  ? "relative flex flex-col justify-between rounded-3xl border-2 border-[#6366f1] bg-[#0c0c16] p-7 shadow-2xl shadow-indigo-500/20"
                  : "flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0a0a12]/80 p-7 shadow-lg backdrop-blur-md"
              }
            >
              <div>
                {tier.featured && (
                  <span className="mb-3 inline-block rounded-full bg-[#6366f1] px-3 py-1 text-[10px] font-semibold tracking-wider text-white uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="font-manrope text-xl font-bold text-white">
                  {tier.name}
                </h3>
                <p className="mt-1.5 text-xs text-white/50">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-manrope text-4xl font-extrabold text-white">
                    {tier.price}
                  </span>
                  <span className="text-xs text-white/45">/{tier.period}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-xs text-white/70"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-[#6366f1]"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <Button
                  nativeButton={false}
                  className={
                    tier.featured
                      ? "w-full bg-[#6366f1] text-white hover:bg-[#5558e6]"
                      : "w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }
                  render={<Link href={tier.href}>{tier.cta}</Link>}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-white/45">
            Need a custom enterprise solution or volume hiring discounts?{" "}
            <Link
              href="/sign-in"
              className="text-[#8b8bff] underline-offset-4 hover:underline"
            >
              Sign in to contact our team
            </Link>{" "}
            or{" "}
            <Link
              href="/"
              className="text-[#8b8bff] underline-offset-4 hover:underline"
            >
              return to home
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
