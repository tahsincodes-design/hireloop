"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Eye,
  Flag,
  Loader2,
  Search,
  ShieldOff,
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
import { EmptyState } from "@/components/dashboard/empty-state"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { formatDate, titleCase } from "@/lib/format"
import { REPORT_STATUSES, type Report, type ReportStatus } from "@/types/report"
import { cn } from "@/lib/utils"

const STATUS_TONE: Record<ReportStatus, string> = {
  open: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  reviewing: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  resolved: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  dismissed: "border-white/10 bg-white/5 text-white/50",
}

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  ...REPORT_STATUSES.map((status) => ({
    value: status,
    label: titleCase(status),
  })),
]

const NEXT_ACTIONS: {
  status: ReportStatus
  label: string
  icon: typeof CheckCircle2
  className: string
}[] = [
  {
    status: "reviewing",
    label: "Start review",
    icon: Eye,
    className: "text-sky-300/80 focus:bg-sky-400/10 focus:text-sky-200",
  },
  {
    status: "resolved",
    label: "Resolve report",
    icon: CheckCircle2,
    className:
      "text-emerald-300/80 focus:bg-emerald-400/10 focus:text-emerald-200",
  },
  {
    status: "dismissed",
    label: "Dismiss report",
    icon: ShieldOff,
    className: "text-white/50 focus:bg-white/[0.06] focus:text-white",
  },
]

export function ReportsTable({ reports }: { reports: Report[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewed, setViewed] = useState<Report | null>(null)
  const [action, setAction] = useState<{
    report: Report
    status: ReportStatus
  } | null>(null)
  const [pending, setPending] = useState(false)

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return reports.filter((report) => {
      if (statusFilter !== "all" && report.status !== statusFilter) return false
      if (!search) return true
      return [
        report.targetName,
        report.reason,
        report.reporterName ?? "",
        report.details ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    })
  }, [reports, query, statusFilter])

  async function runAction() {
    if (!action || pending) return
    setPending(true)

    try {
      await api.patch(endpoints.admin.report(action.report.id), {
        status: action.status,
      })
      notifySuccess(
        "Report updated",
        `Status changed to ${titleCase(action.status).toLowerCase()}.`
      )
      setAction(null)
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not update the report.")
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reports, targets, reporters…"
            aria-label="Search reports"
            className="h-8 border-white/8 bg-black/20 pl-8 text-xs text-white placeholder:text-white/25"
          />
        </div>
        <Select
          items={STATUS_ITEMS}
          value={statusFilter}
          onValueChange={(value) => {
            if (typeof value === "string") setStatusFilter(value)
          }}
        >
          <SelectTrigger
            size="sm"
            className="w-full border-white/8 bg-black/20 text-xs text-white/70 sm:w-[150px]"
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={reports.length === 0 ? "No reports" : "No matching reports"}
          description={
            reports.length === 0
              ? "Flagged users, jobs, and applications will appear here when the reports endpoint returns data."
              : "Try changing the search term or status filter."
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((report) => (
            <li
              key={report.id}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                        STATUS_TONE[report.status]
                      )}
                    >
                      {titleCase(report.status)}
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/45">
                      {titleCase(report.targetType)}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-[13px] font-medium text-white">
                    {report.targetName}
                  </p>
                  <p className="text-[11px] text-white/40">{report.reason}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewed(report)}
                  className="text-[11px] text-white/45 hover:bg-white/[0.06] hover:text-white"
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  Details
                  <ChevronDown
                    className="size-3 text-white/25"
                    aria-hidden="true"
                  />
                </Button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/6 pt-2 text-[10px] text-white/30">
                <span>Reported {formatDate(report.createdAt)}</span>
                {report.reporterName ? (
                  <span>By {report.reporterName}</span>
                ) : null}
                {report.resolvedAt ? (
                  <span>Updated {formatDate(report.resolvedAt)}</span>
                ) : null}
              </div>

              {report.status !== "resolved" && report.status !== "dismissed" ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {NEXT_ACTIONS.filter(
                    (next) => next.status !== report.status
                  ).map((next) => (
                    <Button
                      key={next.status}
                      variant="ghost"
                      size="sm"
                      onClick={() => setAction({ report, status: next.status })}
                      className={cn("h-7 text-[11px]", next.className)}
                    >
                      <next.icon className="size-3" aria-hidden="true" />
                      {next.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={viewed !== null}
        onOpenChange={(open) => {
          if (!open) setViewed(null)
        }}
      >
        <DialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0 sm:max-w-lg">
          {viewed ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-manrope text-base text-white">
                  {viewed.targetName}
                </DialogTitle>
                <DialogDescription className="text-xs text-white/40">
                  {titleCase(viewed.targetType)} report · {viewed.reason}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-white/35">Status</dt>
                  <dd className="text-white/65">{titleCase(viewed.status)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/35">Reported by</dt>
                  <dd className="max-w-56 truncate text-right text-white/65">
                    {viewed.reporterName ?? "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/35">Reported on</dt>
                  <dd className="text-white/65">
                    {formatDate(viewed.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/35">Target ID</dt>
                  <dd className="max-w-56 truncate font-mono text-[10px] text-white/45">
                    {viewed.targetId ?? "—"}
                  </dd>
                </div>
              </dl>

              <div className="space-y-1.5">
                <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
                  Details
                </p>
                <p className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-[13px] leading-relaxed whitespace-pre-line text-white/55">
                  {viewed.details ?? "No additional details were provided."}
                </p>
              </div>

              <DialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
                <Button
                  variant="outline"
                  onClick={() => setViewed(null)}
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
              Update report status?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/45">
              Move{" "}
              <strong className="text-white/70">
                {action?.report.targetName}
              </strong>{" "}
              to {titleCase(action?.status ?? "").toLowerCase()}? This is
              recorded by the Express API.
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
              className="bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : action?.status === "dismissed" ? (
                <XCircle className="size-3.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
