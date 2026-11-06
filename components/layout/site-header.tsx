"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
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

const NAV_LINKS = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Company" },
  { href: "/pricing", label: "Pricing" },
] as const

export function SiteHeader() {
  const pathname = usePathname()

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

          <div className="flex shrink-0 items-center gap-4">
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
          </div>
        </div>

        {/* Mobile trigger */}
        <div className="shrink-0 md:hidden">
          <Sheet>
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
                <Link
                  href="/sign-in"
                  className="text-center text-sm font-medium text-[#5b8cff] transition-colors hover:text-[#7aa8ff]"
                >
                  Sign In
                </Link>
                <Button
                  size="sm"
                  className="w-full bg-[#6366f1] text-white hover:bg-[#5558e6]"
                  nativeButton={false}
                  render={<Link href="/sign-up">Get Started</Link>}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
