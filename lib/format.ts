const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
})

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")

export function getInitials(name: string | null | undefined) {
  const value = (name ?? "").trim()
  if (!value) return "?"

  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatDate(value: string | null | undefined, fallback = "—") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return DATE_FORMATTER.format(date)
}

export function formatDateTime(
  value: string | null | undefined,
  fallback = "—"
) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return DATE_TIME_FORMATTER.format(date)
}

export function formatTime(value: string | null | undefined, fallback = "—") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return TIME_FORMATTER.format(date)
}

export function formatNumber(value: number | null | undefined, fallback = "—") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }
  return NUMBER_FORMATTER.format(value)
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency = "USD"
) {
  if (min === null && max === null) return "Salary not disclosed"

  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : `${currency} `

  const compact = (value: number) =>
    value >= 1000
      ? `${symbol}${Math.round(value / 1000)}k`
      : `${symbol}${value}`

  if (min !== null && max !== null) {
    return min === max ? compact(min) : `${compact(min)} – ${compact(max)}`
  }

  return min !== null ? `From ${compact(min)}` : `Up to ${compact(max ?? 0)}`
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function titleCase(value: string | null | undefined) {
  if (!value) return "—"
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${formatNumber(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`
}

export function truncate(value: string, length = 120) {
  if (value.length <= length) return value
  return `${value.slice(0, length).trimEnd()}…`
}
