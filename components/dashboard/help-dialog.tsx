"use client"

import Link from "next/link"
import { CircleHelp, Command, LifeBuoy, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { UserRole } from "@/lib/roles"

export function HelpDialog({ role }: { role: UserRole }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Help and support"
            title="Help & support"
            className="text-white/45 hover:bg-white/[0.06] hover:text-white"
          />
        }
      >
        <CircleHelp className="size-4" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-manrope text-lg text-white">
            Help & support
          </DialogTitle>
          <DialogDescription className="text-white/45">
            Quick reference for the HireLoop dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-white">
              <Command className="size-4 text-indigo-300" aria-hidden="true" />
              Keyboard
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">D</kbd>{" "}
              outside an input to toggle the site theme. Tab moves through
              navigation and actions.
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-white">
              <ShieldCheck
                className="size-4 text-emerald-300"
                aria-hidden="true"
              />
              Roles & permissions
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              You are signed in with the {role} workspace. Role changes are
              verified server-side; only administrators can change another
              account&apos;s role.
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-white">
              <LifeBuoy className="size-4 text-amber-300" aria-hidden="true" />
              Need more help?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              If a section shows an unavailable backend endpoint, review the API
              connection status in Settings or contact your platform
              administrator.
            </p>
          </div>
        </div>

        <DialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
          <DialogClose
            render={
              <Button
                variant="outline"
                className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
              />
            }
          >
            Close
          </DialogClose>
          <Button
            nativeButton={false}
            className="bg-indigo-500 text-white hover:bg-indigo-400"
            render={
              <Link href={`/dashboard/${role}/settings`}>Open settings</Link>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
