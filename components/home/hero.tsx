import Image from "next/image"
import Link from "next/link"
import {
  BriefcaseBusiness,
  Building2,
  Flame,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const STATS = [
  { value: "50K", label: "Active Jobs", icon: BriefcaseBusiness },
  { value: "12K", label: "Companies", icon: Building2 },
  { value: "2M", label: "Job Seekers", icon: Users },
  { value: "97%", label: "Satisfaction Rate", icon: Star },
] as const

const TRENDING = ["AI Engineering", "Dev-ops Engineer"] as const

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#05050a] text-white">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className="h-auto gap-2 rounded-full border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase backdrop-blur-sm sm:text-[11px]"
          >
            <Sparkles className="size-3 text-[#f97316]" aria-hidden="true" />
            50,000+ new jobs this month
          </Badge>
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-center font-manrope text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
          Find Your Dream Job Today
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-pretty text-white/55 sm:text-base lg:text-lg">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role faster.
        </p>

        {/* Search */}
        <form
          role="search"
          action="/jobs"
          className="mx-auto mt-8 max-w-3xl sm:mt-10"
        >
          <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#0b0b12]/90 p-2 shadow-[0_24px_80px_-24px_rgba(99,102,241,0.55)] backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
            <div className="flex flex-1 items-center gap-2.5 px-2.5 sm:px-4">
              <Search
                className="size-4 shrink-0 text-white/35"
                aria-hidden="true"
              />
              <Input
                type="search"
                name="q"
                aria-label="Job title, skill or company"
                placeholder="Job title, skill or company"
                className="h-10 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/35 focus-visible:ring-0 sm:h-11 md:text-sm dark:bg-transparent"
              />
            </div>

            <Separator
              orientation="vertical"
              className="mx-3 hidden h-7 self-center bg-white/10 sm:block"
            />

            <div className="flex flex-1 items-center gap-2.5 border-t border-white/5 px-2.5 pt-1 pb-1 sm:border-0 sm:border-t-0 sm:px-4 sm:py-0">
              <MapPin
                className="size-4 shrink-0 text-white/35"
                aria-hidden="true"
              />
              <Input
                type="text"
                name="location"
                aria-label="Location or Remote"
                placeholder="Location or Remote"
                className="h-10 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/35 focus-visible:ring-0 sm:h-11 md:text-sm dark:bg-transparent"
              />
            </div>

            <Button
              type="submit"
              size="icon-lg"
              aria-label="Search jobs"
              className="h-10 w-full shrink-0 rounded-xl bg-[#6366f1] text-white hover:bg-[#5558e6] sm:h-11 sm:w-11 sm:rounded-full"
            >
              <Search className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>

        {/* Trending */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-white/45 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Flame className="size-3.5 text-[#f97316]" aria-hidden="true" />
            Trending Position
          </span>
          {TRENDING.map((term) => (
            <Link
              key={term}
              href={`/jobs?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/65 transition-colors hover:border-white/20 hover:text-white"
            >
              {term}
            </Link>
          ))}
          <Link
            href="/pricing"
            className="ml-1 text-white/45 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Book a Call
          </Link>
        </div>
      </div>

      {/* Globe + stats */}
      <div className="relative mt-6 overflow-hidden sm:mt-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
        >
          <Image
            src="/images/hero-globe.png"
            alt=""
            width={1440}
            height={1202}
            priority
            className="h-auto w-[190%] max-w-none shrink-0 select-none sm:w-[140%] lg:w-[118%]"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-40 pb-8 sm:px-6 sm:pt-52 sm:pb-12 lg:pt-64">
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-white/60 sm:mb-8 sm:text-base">
            Assisting over 15,000 job seekers find their dream positions.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-[#0a0a12]/80 p-4 backdrop-blur-md sm:p-5"
              >
                <Icon className="size-4 text-white/40" aria-hidden="true" />
                <p className="mt-5 font-manrope text-2xl font-semibold tracking-tight text-white sm:mt-6 sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-white/45 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
