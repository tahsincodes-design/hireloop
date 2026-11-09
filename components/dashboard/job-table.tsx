"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldOff,
  Trash2,
  Users,
  XCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/dashboard/empty-state"
import { JobDetailDialog } from "@/components/dashboard/job-detail-dialog"
import { JobFormDialog } from "@/components/dashboard/job-form-dialog"
import { JobStatusBadge } from "@/components/dashboard/status-badge"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { formatDate, formatNumber, titleCase } from "@/lib/format"
import { JOB_STATUSES } from "@/types/job"
import type { Job, JobStatus } from "@/types/job"

const PAGE_SIZE = 8

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  ...JOB_STATUSES.map((status) => ({
    value: status,
    label: titleCase(status),
  })),
]

type ConfirmAction =
  { type: "status"; job: Job; status: JobStatus } | { type: "delete"; job: Job }

export function JobTable({
  jobs,
  variant = "recruiter",
}: {
  jobs: Job[]
  variant?: "recruiter" | "admin"
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [pending, setPending] = useState(false)

  const companies = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((job) => job.companyName).filter(Boolean))
      ).sort(),
    [jobs]
  )
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          jobs
            .map((job) => job.category)
            .filter((category): category is string => Boolean(category))
        )
      ).sort(),
    [jobs]
  )

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false
      if (companyFilter !== "all" && job.companyName !== companyFilter) {
        return false
      }
      if (categoryFilter !== "all" && job.category !== categoryFilter) {
        return false
      }
      if (!search) return true
      return [job.title, job.companyName, job.location, job.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search)
    })
  }, [jobs, query, statusFilter, companyFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function resetPage() {
    setPage(1)
  }

  async function runConfirmedAction() {
    if (!confirmAction || pending) return
    setPending(true)

    try {
      if (confirmAction.type === "delete") {
        await api.delete(endpoints.job(confirmAction.job.id))
        notifySuccess("Job deleted", confirmAction.job.title)
      } else {
        await api.patch(endpoints.job(confirmAction.job.id), {
          status: confirmAction.status,
        })
        notifySuccess(
          "Job updated",
          `${confirmAction.job.title} is now ${titleCase(confirmAction.status).toLowerCase()}.`
        )
      }

      setConfirmAction(null)
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not update the job.")
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
            placeholder="Search jobs, companies, locations…"
            aria-label="Search jobs"
            className="h-8 border-white/8 bg-black/20 pl-8 text-xs text-white placeholder:text-white/25"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
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
              className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[140px]"
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

          {variant === "admin" ? (
            <>
              <Select
                items={[
                  { value: "all", label: "All recruiters" },
                  ...companies.map((company) => ({
                    value: company,
                    label: company,
                  })),
                ]}
                value={companyFilter}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setCompanyFilter(value)
                    resetPage()
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[150px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
                  <SelectItem value="all">All recruiters</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                items={[
                  { value: "all", label: "All categories" },
                  ...categories.map((category) => ({
                    value: category,
                    label: category,
                  })),
                ]}
                value={categoryFilter}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setCategoryFilter(value)
                    resetPage()
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[150px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : null}
        </div>
      </div>

      {paged.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={jobs.length === 0 ? "No jobs yet" : "No matching jobs"}
          description={
            jobs.length === 0
              ? "Post your first role or wait for the backend to return your job listings."
              : "Try changing the search term or filters."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8">
          <Table>
            <TableHeader>
              <TableRow className="border-white/8 hover:bg-transparent">
                <TableHead className="h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase">
                  Job
                </TableHead>
                <TableHead className="hidden h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase md:table-cell">
                  Applications
                </TableHead>
                <TableHead className="h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase">
                  Status
                </TableHead>
                <TableHead className="hidden h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase lg:table-cell">
                  Posted
                </TableHead>
                <TableHead className="hidden h-9 px-3 text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase lg:table-cell">
                  Deadline
                </TableHead>
                <TableHead className="h-9 w-20 px-3 text-right text-[10px] font-medium tracking-[0.12em] text-white/30 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((job) => (
                <TableRow
                  key={job.id}
                  className="border-white/6 hover:bg-white/[0.02]"
                >
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-[10px] font-semibold text-indigo-200">
                        {job.companyName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-56 truncate text-[13px] font-medium text-white">
                          {job.title}
                        </p>
                        <p className="max-w-56 truncate text-[11px] text-white/35">
                          {job.companyName} · {job.location}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-3 py-3 md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
                      <Users
                        className="size-3 text-white/25"
                        aria-hidden="true"
                      />
                      {job.applicantsCount === null
                        ? "—"
                        : formatNumber(job.applicantsCount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="hidden px-3 py-3 text-xs text-white/45 lg:table-cell">
                    {formatDate(job.postedAt)}
                  </TableCell>
                  <TableCell className="hidden px-3 py-3 text-xs text-white/45 lg:table-cell">
                    {formatDate(job.deadline, "No deadline")}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${job.title}`}
                            className="text-white/35 hover:bg-white/[0.06] hover:text-white"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-52 border border-white/10 bg-[#0d0d16] p-1.5 text-white shadow-xl ring-0"
                      >
                        <DropdownMenuLabel className="px-2 py-1 text-[10px] tracking-wide text-white/30 uppercase">
                          Manage job
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedJob(job)}
                          className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                          View job
                        </DropdownMenuItem>
                        {variant === "recruiter" ? (
                          <DropdownMenuItem
                            onClick={() => setEditingJob(job)}
                            className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit job
                          </DropdownMenuItem>
                        ) : null}
                        {variant === "recruiter" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/recruiter/applicants?jobId=${job.id}`
                              )
                            }
                            className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                          >
                            <Users className="size-3.5" aria-hidden="true" />
                            View applicants
                          </DropdownMenuItem>
                        ) : null}

                        <DropdownMenuSeparator className="bg-white/8" />

                        {variant === "recruiter" ? (
                          <>
                            <DropdownMenuItem
                              disabled={job.status !== "active"}
                              onClick={() =>
                                setConfirmAction({
                                  type: "status",
                                  job,
                                  status: "closed",
                                })
                              }
                              className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                            >
                              <XCircle
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Close job
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={job.status === "paused"}
                              onClick={() =>
                                setConfirmAction({
                                  type: "status",
                                  job,
                                  status: "paused",
                                })
                              }
                              className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-white/65 focus:bg-white/[0.06] focus:text-white"
                            >
                              <ShieldOff
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Pause job
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              disabled={job.status === "active"}
                              onClick={() =>
                                setConfirmAction({
                                  type: "status",
                                  job,
                                  status: "active",
                                })
                              }
                              className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-emerald-300/80 focus:bg-emerald-400/10 focus:text-emerald-200"
                            >
                              <CheckCircle2
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Approve job
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={job.status === "rejected"}
                              onClick={() =>
                                setConfirmAction({
                                  type: "status",
                                  job,
                                  status: "rejected",
                                })
                              }
                              className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-amber-300/80 focus:bg-amber-400/10 focus:text-amber-200"
                            >
                              <XCircle
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Reject job
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={job.status === "suspended"}
                              onClick={() =>
                                setConfirmAction({
                                  type: "status",
                                  job,
                                  status: "suspended",
                                })
                              }
                              className="cursor-pointer gap-2 px-2 py-1.5 text-xs text-rose-300/80 focus:bg-rose-400/10 focus:text-rose-200"
                            >
                              <ShieldOff
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Suspend job
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator className="bg-white/8" />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            setConfirmAction({ type: "delete", job })
                          }
                          className="cursor-pointer gap-2 px-2 py-1.5 text-xs focus:bg-rose-400/10 focus:text-rose-300"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Delete job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing{" "}
          {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length} jobs
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

      {selectedJob ? (
        <JobDetailDialog
          job={selectedJob}
          hideTrigger
          canApply={false}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedJob(null)
          }}
        />
      ) : null}

      {editingJob ? (
        <JobFormDialog
          job={editingJob}
          hideTrigger
          open
          onOpenChange={(open) => {
            if (!open) setEditingJob(null)
          }}
        />
      ) : null}

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setConfirmAction(null)
        }}
      >
        <AlertDialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle
                className="size-4 text-amber-300"
                aria-hidden="true"
              />
              {confirmAction?.type === "delete"
                ? "Delete this job?"
                : "Update job status?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/45">
              {confirmAction?.type === "delete" ? (
                <>
                  <strong className="text-white/70">
                    {confirmAction.job.title}
                  </strong>{" "}
                  and its associated applicants will be affected. This action
                  cannot be undone.
                </>
              ) : (
                <>
                  Change the status of{" "}
                  <strong className="text-white/70">
                    {confirmAction?.job.title}
                  </strong>{" "}
                  to {titleCase(confirmAction?.status ?? "").toLowerCase()}?
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
              onClick={runConfirmedAction}
              disabled={pending}
              className={
                confirmAction?.type === "delete"
                  ? "bg-rose-500 text-white hover:bg-rose-400"
                  : "bg-indigo-500 text-white hover:bg-indigo-400"
              }
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              {confirmAction?.type === "delete" ? "Delete job" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
