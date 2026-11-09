export const REPORT_STATUSES = [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const REPORT_TARGET_TYPES = ["user", "job", "application"] as const
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]

export type Report = {
  id: string
  targetType: ReportTargetType
  targetId: string | null
  targetName: string
  reason: string
  details: string | null
  status: ReportStatus
  reporterId: string | null
  reporterName: string | null
  createdAt: string | null
  resolvedAt: string | null
}
