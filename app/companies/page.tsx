import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Building2, ExternalLink, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Companies · HireLoop",
  description:
    "Explore top technology companies and fast-growing startups hiring on HireLoop.",
}

const FEATURED_COMPANIES = [
  {
    name: "Google",
    logo: "/logos/google.png",
    industry: "Cloud & AI",
    openRoles: 142,
  },
  {
    name: "Microsoft",
    logo: "/logos/microsoft.png",
    industry: "Enterprise Tech",
    openRoles: 98,
  },
  {
    name: "Meta",
    logo: "/logos/meta.png",
    industry: "AI & Social Media",
    openRoles: 76,
  },
  {
    name: "Apple",
    logo: "/logos/apple.png",
    industry: "Hardware & Systems",
    openRoles: 64,
  },
  {
    name: "Amazon",
    logo: "/logos/amazon.png",
    industry: "E-Commerce & AWS",
    openRoles: 185,
  },
  {
    name: "Nvidia",
    logo: "/logos/nvidia.png",
    industry: "Semiconductors & AI",
    openRoles: 53,
  },
  {
    name: "Netflix",
    logo: "/logos/netflix.png",
    industry: "Streaming & Media",
    openRoles: 32,
  },
  {
    name: "Spotify",
    logo: "/logos/spotify.png",
    industry: "Audio & Music",
    openRoles: 29,
  },
  {
    name: "Airbnb",
    logo: "/logos/airbnb.png",
    industry: "Travel & Hospitality",
    openRoles: 24,
  },
  {
    name: "Tesla",
    logo: "/logos/tesla.png",
    industry: "Autonomy & Energy",
    openRoles: 47,
  },
  {
    name: "Uber",
    logo: "/logos/uber.png",
    industry: "Mobility & Delivery",
    openRoles: 38,
  },
  {
    name: "Adobe",
    logo: "/logos/adobe.png",
    industry: "Creative Software",
    openRoles: 41,
  },
] as const

export default function CompaniesPage() {
  return (
    <main className="min-h-svh bg-[#05050a] px-4 pt-28 pb-20 text-white sm:px-6 lg:px-8">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(55%_100%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]"
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
            <Sparkles className="size-3 text-[#6366f1]" aria-hidden="true" />
            Hiring Partners
          </Badge>

          <h1 className="mt-4 font-manrope text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Work with World-Class Companies
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Discover leading technology innovators actively hiring talent on
            HireLoop. From high-growth startups to industry titans.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {FEATURED_COMPANIES.map((company) => (
            <div
              key={company.name}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0a0a12]/80 p-5 shadow-lg backdrop-blur-md transition-all hover:border-indigo-400/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={40}
                    height={40}
                    className="max-h-8 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-white">
                    {company.name}
                  </h3>
                  <p className="truncate text-xs text-white/45">
                    {company.industry}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-indigo-300">
                  {company.openRoles} open roles
                </span>
                <Link
                  href={`/dashboard/seeker/jobs?q=${encodeURIComponent(company.name)}`}
                  className="inline-flex items-center gap-1 text-xs text-white/45 transition-colors group-hover:text-white"
                >
                  View roles
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 text-center sm:p-12">
          <Building2
            className="mx-auto size-10 text-indigo-400"
            aria-hidden="true"
          />
          <h2 className="mt-4 font-manrope text-2xl font-bold text-white sm:text-3xl">
            Are you hiring talent?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/50">
            Publish your open jobs, reach thousands of qualified applicants, and
            streamline your hiring pipeline on HireLoop.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              className="bg-[#6366f1] text-white hover:bg-[#5558e6]"
              render={<Link href="/sign-up">Start Hiring Today</Link>}
            />
            <Button
              variant="outline"
              nativeButton={false}
              className="border-white/15 bg-transparent text-white hover:bg-white/10"
              render={<Link href="/">Back to Home</Link>}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
