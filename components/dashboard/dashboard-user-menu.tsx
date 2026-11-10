"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  ChevronDown,
  Home,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleBadge } from "@/components/dashboard/status-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { authClient } from "@/lib/auth-client"
import { ROLE_META } from "@/lib/dashboard/navigation"
import type { UserRole } from "@/lib/roles"
import type { AuthUser } from "@/types/user"

function profileHref(role: UserRole) {
  if (role === "seeker") return "/dashboard/seeker/profile"
  if (role === "recruiter") return "/dashboard/recruiter/company"
  return "/dashboard/admin/settings"
}

export function DashboardUserMenu({
  user,
  role,
}: {
  user: AuthUser
  role: UserRole
}) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const roleMeta = ROLE_META[role]

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authClient.signOut()
      router.push("/sign-in")
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1 text-left transition-colors outline-none hover:border-white/8 hover:bg-white/[0.04] focus-visible:border-indigo-400/40 focus-visible:ring-2 focus-visible:ring-indigo-400/20">
        <UserAvatar name={user.name} image={user.image} size="sm" />
        <span className="hidden min-w-0 leading-tight sm:block">
          <span className="block max-w-36 truncate text-[13px] font-medium text-white">
            {user.name}
          </span>
          <span className="block text-[10px] text-white/35">
            {roleMeta.label}
          </span>
        </span>
        <RoleBadge role={role} className="hidden lg:inline-flex" />
        <ChevronDown
          className="hidden size-3.5 text-white/30 sm:block"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 border border-white/10 bg-[#0d0d16] p-1.5 text-white shadow-2xl ring-0 shadow-black/50"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <span className="flex items-center gap-2.5">
            <UserAvatar name={user.name} image={user.image} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="block truncate text-[11px] font-normal text-white/40">
                {user.email}
              </span>
            </span>
          </span>
        </DropdownMenuLabel>

        <div className="px-2 pb-2">
          <RoleBadge role={role} />
        </div>

        <DropdownMenuSeparator className="bg-white/8" />

        <DropdownMenuItem
          onClick={() => router.push(profileHref(role))}
          className="cursor-pointer gap-2 px-2 py-2 text-white/70 focus:bg-white/[0.06] focus:text-white"
        >
          {role === "recruiter" ? (
            <Building2 className="size-4" aria-hidden="true" />
          ) : (
            <UserRound className="size-4" aria-hidden="true" />
          )}
          {role === "recruiter" ? "Company profile" : "My profile"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/${role}/settings`)}
          className="cursor-pointer gap-2 px-2 py-2 text-white/70 focus:bg-white/[0.06] focus:text-white"
        >
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/8" />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={signingOut}
          className="cursor-pointer gap-2 px-2 py-2 focus:bg-rose-400/10 focus:text-rose-300"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>

        <div className="px-2 py-1.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
          >
            <Home className="size-3.5" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
