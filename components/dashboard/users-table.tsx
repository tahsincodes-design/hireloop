"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowUpDown,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/dashboard/empty-state"
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/status-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { api } from "@/lib/api/client"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { USER_ROLES, type UserRole } from "@/lib/roles"
import { formatDate, formatNumber, titleCase } from "@/lib/format"
import type { PlatformUser, UserStatus } from "@/types/user"

const PAGE_SIZE = 8

const ROLE_ITEMS = [
  { value: "all", label: "All roles" },
  ...USER_ROLES.map((role) => ({ value: role, label: titleCase(role) })),
]

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
]

const SORT_ITEMS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
]

type AdminAction =
  | { type: "role"; user: PlatformUser; role: UserRole }
  | { type: "status"; user: PlatformUser; status: UserStatus }
  | { type: "delete"; user: PlatformUser }

export function UsersTable({
  users,
  currentUserId,
  manage = true,
  lockRoleTo,
  initialQuery = "",
}: {
  users: PlatformUser[]
  currentUserId: string
  manage?: boolean
  lockRoleTo?: UserRole
  initialQuery?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [roleFilter, setRoleFilter] = useState(lockRoleTo ?? "all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [viewedUser, setViewedUser] = useState<PlatformUser | null>(null)
  const [action, setAction] = useState<AdminAction | null>(null)
  const [pending, setPending] = useState(false)

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    const result = users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false
      if (statusFilter !== "all" && user.status !== statusFilter) return false
      if (!search) return true
      return [user.name, user.email, user.companyName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search)
    })

    return result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name)
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sort === "oldest" ? aDate - bDate : bDate - aDate
    })
  }, [users, query, roleFilter, statusFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function resetPage() {
    setPage(1)
  }

  async function runAction() {
    if (!action || pending) return
    setPending(true)

    try {
      if (action.type === "delete") {
        await api.delete(`/api/admin/users/${action.user.id}`, {
          sameOrigin: true,
        })
        notifySuccess("Account deleted", action.user.email)
      } else if (action.type === "role") {
        await api.patch(
          `/api/admin/users/${action.user.id}`,
          { role: action.role },
          { sameOrigin: true }
        )
        notifySuccess(
          "Role updated",
          `${action.user.name} is now a ${titleCase(action.role).toLowerCase()}.`
        )
      } else {
        await api.patch(
          `/api/admin/users/${action.user.id}`,
          { status: action.status },
          { sameOrigin: true }
        )
        notifySuccess(
          action.status === "suspended"
            ? "Account suspended"
            : "Account reactivated",
          action.user.email
        )
      }

      setAction(null)
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not update the account.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-white/30"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
            placeholder="Search by name, email, or company…"
            aria-label="Search users"
            className="h-8 border-white/8 bg-black/20 pl-8 text-xs text-white placeholder:text-white/25"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          {!lockRoleTo ? (
            <Select
              items={ROLE_ITEMS}
              value={roleFilter}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setRoleFilter(value)
                  resetPage()
                }
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[125px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
                {ROLE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Select
            items={STATUS_ITEMS}
            value={statusFilter}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setStatusFilter(value)
                resetPage()
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[130px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
              {STATUS_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={SORT_ITEMS}
            value={sort}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setSort(value)
                resetPage()
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[140px]"
            >
              <ArrowUpDown
                className="size-3 text-white/30"
                aria-hidden="true"
              />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
              {SORT_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {paged.length === 0 ? (
        <EmptyState
          icon={Users}
          title={users.length === 0 ? "No users returned" : "No matching users"}
          description={
            users.length === 0
              ? "The users endpoint responded successfully, but returned no accounts."
              : "Try clearing the search or filters."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8">
          <Table>
            <TableHeader>
              <TableRow className="border-white/8 hover:bg-transparent">
                <TableHead className="h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase">
                  User
                </TableHead>
                <TableHead className="h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase">
                  Role
                </TableHead>
                <TableHead className="hidden h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase sm:table-cell">
                  Status
                </TableHead>
                <TableHead className="hidden h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase lg:table-cell">
                  Registered
                </TableHead>
                <TableHead className="h-9 w-20 px-3 text-right text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((user) => {
                const isSelf = user.id === currentUserId
                return (
                  <TableRow
                    key={user.id}
                    className="border-white/6 hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={user.name} image={user.image} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-white">
                            <span className="max-w-48 truncate">
                              {user.name}
                            </span>
                            {isSelf ? (
                              <span className="rounded bg-indigo-400/15 px-1 py-0.5 text-[9px] text-indigo-300">
                                You
                              </span>
                            ) : null}
                          </p>
                          <p className="max-w-56 truncate text-[11px] text-white/35">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="hidden px-3 py-3 sm:table-cell">
                      <UserStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="hidden px-3 py-3 text-xs text-white/45 lg:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${user.name}`}
                              className="text-white/35 hover:bg-white/[0.06] hover:text-white"
                            />
                          }
                        >
                          <MoreHorizontal
                            className="size-4"
                            aria-hidden="true"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 border border-white/10 bg-[#0d0d16] p-1.5 text-white shadow-xl ring-0"
                        >
                          <DropdownMenuLabel className="px-2 py-1 text-[10px] tracking-wide text-white/30 uppercase">
                            Account
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setViewedUser(user)}
                            className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                          >
                            <Eye className="size-3.5" aria-hidden="true" />
                            View details
                          </DropdownMenuItem>

                          {manage ? (
                            <>
                              <DropdownMenuSeparator className="bg-white/8" />
                              <DropdownMenuLabel className="px-2 py-1 text-[10px] tracking-wide text-white/30 uppercase">
                                Change role
                              </DropdownMenuLabel>
                              {USER_ROLES.map((role) => (
                                <DropdownMenuItem
                                  key={role}
                                  disabled={isSelf || role === user.role}
                                  onClick={() =>
                                    setAction({ type: "role", user, role })
                                  }
                                  className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                                >
                                  <UserCog
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                  Make {titleCase(role).toLowerCase()}
                                  {role === user.role ? (
                                    <span className="ml-auto text-[9px] text-white/25">
                                      Current
                                    </span>
                                  ) : null}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator className="bg-white/8" />
                              {user.status === "suspended" ? (
                                <DropdownMenuItem
                                  disabled={isSelf}
                                  onClick={() =>
                                    setAction({
                                      type: "status",
                                      user,
                                      status: "active",
                                    })
                                  }
                                  className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-emerald-300/80 focus:bg-emerald-400/10 focus:text-emerald-200"
                                >
                                  <UserCheck
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                  Activate account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled={isSelf}
                                  onClick={() =>
                                    setAction({
                                      type: "status",
                                      user,
                                      status: "suspended",
                                    })
                                  }
                                  className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-amber-300/80 focus:bg-amber-400/10 focus:text-amber-200"
                                >
                                  <Ban
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                  Suspend account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={isSelf}
                                onClick={() =>
                                  setAction({ type: "delete", user })
                                }
                                className="cursor-pointer gap-2 px-2 py-1.5 text-xs focus:bg-rose-400/10 focus:text-rose-300"
                              >
                                <Trash2
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                Delete account
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing{" "}
          {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
          {formatNumber(filtered.length)} users
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            aria-label="Previous page"
            className="text-white/45 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="px-2 text-[11px] text-white/45">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            aria-label="Next page"
            className="text-white/45 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Dialog
        open={viewedUser !== null}
        onOpenChange={(open) => {
          if (!open) setViewedUser(null)
        }}
      >
        <DialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-md">
          {viewedUser ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={viewedUser.name}
                    image={viewedUser.image}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <DialogTitle className="font-manrope text-base text-white">
                      {viewedUser.name}
                    </DialogTitle>
                    <DialogDescription className="truncate text-xs text-white/40">
                      {viewedUser.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <dl className="grid gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/35">Role</dt>
                  <dd>
                    <RoleBadge role={viewedUser.role} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/35">Status</dt>
                  <dd>
                    <UserStatusBadge status={viewedUser.status} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/35">Email verified</dt>
                  <dd className="text-white/65">
                    {viewedUser.emailVerified ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/35">Registered</dt>
                  <dd className="text-white/65">
                    {formatDate(viewedUser.createdAt)}
                  </dd>
                </div>
                {viewedUser.companyName ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/35">Company</dt>
                    <dd className="max-w-48 truncate text-right text-white/65">
                      {viewedUser.companyName}
                    </dd>
                  </div>
                ) : null}
                {viewedUser.location ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/35">Location</dt>
                    <dd className="max-w-48 truncate text-right text-white/65">
                      {viewedUser.location}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <DialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
                <Button
                  variant="outline"
                  onClick={() => setViewedUser(null)}
                  className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setAction(null)
        }}
      >
        <AlertDialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle
                className="size-4 text-amber-300"
                aria-hidden="true"
              />
              {action?.type === "delete"
                ? "Delete this account?"
                : action?.type === "role"
                  ? "Change account role?"
                  : "Update account status?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/45">
              {action?.type === "delete" ? (
                <>
                  This permanently deletes{" "}
                  <strong className="text-white/70">{action.user.email}</strong>{" "}
                  along with its sessions and linked sign-in accounts.
                </>
              ) : action?.type === "role" ? (
                <>
                  Give{" "}
                  <strong className="text-white/70">{action.user.name}</strong>{" "}
                  the {titleCase(action.role).toLowerCase()} role? The change is
                  verified server-side and applied immediately.
                </>
              ) : (
                <>
                  {action?.status === "suspended" ? "Suspend" : "Reactivate"}{" "}
                  <strong className="text-white/70">{action?.user.name}</strong>
                  &apos;s account? Suspended users cannot access the dashboard
                  or authenticated API routes.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
            <AlertDialogCancel
              disabled={pending}
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={runAction}
              disabled={pending}
              className={
                action?.type === "delete"
                  ? "bg-rose-500 text-white hover:bg-rose-400"
                  : "bg-indigo-500 text-white hover:bg-indigo-400"
              }
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              {action?.type === "delete" ? "Delete account" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
