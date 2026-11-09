"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"

const NAV_LINKS = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Company" },
  { href: "/pricing", label: "Pricing" },
] as const

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const displayName = user?.name?.trim() || user?.email || ""

  async function handleSignOut() {
    if (signingOut) return

    setSigningOut(true)

    try {
      await authClient.signOut()
      setMobileOpen(false)
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  // The dashboard renders its own authenticated shell and sidebar.
  if (pathname.startsWith("/dashboard")) return null

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c0c11]/95 px-4 shadow-lg shadow-black/20 backdrop-blur-md sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-white/40"
          aria-label="HireLoop home"
        >
          <Image
            src="/images/logo.png"
            alt="HireLoop logo"
            width={154}
            height={44}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        {/* Desktop nav + CTAs */}
        <div className="hidden items-center gap-5 md:flex">
          <NavigationMenu aria-label="Primary">
            <NavigationMenuList className="gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href)
                return (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      href={link.href}
                      data-active={isActive}
                      className="text-sm text-white/80 hover:bg-white/10 hover:text-white data-active:bg-white/10 data-active:text-white"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>

          <span className="h-5 w-px bg-white/20" aria-hidden="true" />

          <div className="flex shrink-0 items-center gap-3">
            {isPending ? (
              <span
                aria-hidden="true"
                className="h-8 w-32 animate-pulse rounded-full bg-white/10"
              />
            ) : user ? (
              <>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-full bg-[#6366f1]/20 text-[11px] font-semibold text-[#c7c8ff] ring-1 ring-[#6366f1]/40"
                  >
                    {getInitials(displayName)}
                  </span>
                  <span className="max-w-40 truncate text-sm font-medium text-white/80">
                    {displayName}
                  </span>
                </span>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-[#8b8bff] transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-white/60 hover:bg-white/10 hover:text-white"
                >
                  {signingOut ? "Signing out…" : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-[#5b8cff] transition-colors hover:text-[#7aa8ff]"
                >
                  Sign In
                </Link>
                <Button
                  size="sm"
                  className="bg-[#6366f1] text-white hover:bg-[#5558e6]"
                  nativeButton={false}
                  render={<Link href="/sign-up">Get Started</Link>}
                />
              </>
            )}
          </div>
        </div>

        {/* Mobile trigger */}
        <div className="shrink-0 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-3/4 border-white/10 bg-[#0c0c11] text-white sm:max-w-sm"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <Link
                  href="/"
                  className="mt-1 flex items-center gap-2"
                  aria-label="HireLoop home"
                >
                  <Image
                    src="/images/logo.png"
                    alt="HireLoop logo"
                    width={154}
                    height={44}
                    className="h-8 w-auto"
                  />
                </Link>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white"
                          : "rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      }
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <Separator className="my-2 bg-white/10" />

              <div className="flex flex-col gap-3 px-4 pb-4">
                {isPending ? (
                  <span
                    aria-hidden="true"
                    className="h-10 w-full animate-pulse rounded-lg bg-white/10"
                  />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6366f1]/20 text-xs font-semibold text-[#c7c8ff] ring-1 ring-[#6366f1]/40"
                      >
                        {getInitials(displayName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {displayName}
                        </span>
                        <span className="block truncate text-xs text-white/45">
                          {user.email}
                        </span>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      nativeButton={false}
                      className="w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                      render={
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileOpen(false)}
                        >
                          Open dashboard
                        </Link>
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      {signingOut ? "Signing out…" : "Sign Out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="text-center text-sm font-medium text-[#5b8cff] transition-colors hover:text-[#7aa8ff]"
                    >
                      Sign In
                    </Link>
                    <Button
                      size="sm"
                      className="w-full bg-[#6366f1] text-white hover:bg-[#5558e6]"
                      nativeButton={false}
                      render={
                        <Link
                          href="/sign-up"
                          onClick={() => setMobileOpen(false)}
                        >
                          Get Started
                        </Link>
                      }
                    />
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
