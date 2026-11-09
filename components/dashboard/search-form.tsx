import type { ReactNode } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchForm({
  action,
  defaultValue = "",
  placeholder = "Search…",
  label = "Search",
  children,
}: {
  action: string
  defaultValue?: string
  placeholder?: string
  label?: string
  children?: ReactNode
}) {
  return (
    <form
      action={action}
      method="get"
      role="search"
      className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-2.5 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-white/30"
          aria-hidden="true"
        />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={label}
          className="h-8 border-white/8 bg-black/20 pl-8 text-xs text-white placeholder:text-white/25"
        />
      </div>
      {children}
      <Button
        type="submit"
        size="sm"
        className="h-8 bg-indigo-500 text-[11px] text-white hover:bg-indigo-400"
      >
        Search
      </Button>
    </form>
  )
}
