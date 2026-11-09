import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { QUICK_ACTIONS } from "@/lib/dashboard/navigation"
import type { UserRole } from "@/lib/roles"

export function QuickActions({ role }: { role: UserRole }) {
  const actions = QUICK_ACTIONS[role]

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 transition-colors hover:border-indigo-400/30 hover:bg-indigo-400/[0.05]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/55 transition-colors group-hover:border-indigo-400/25 group-hover:bg-indigo-400/10 group-hover:text-indigo-300">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                {action.title}
                <ArrowUpRight className="size-3.5 text-white/25 transition-colors group-hover:text-indigo-300" />
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-white/40">
                {action.description}
              </span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
