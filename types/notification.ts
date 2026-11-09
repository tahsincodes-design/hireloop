export type AppNotification = {
  id: string
  title: string
  message: string
  type: "application" | "interview" | "job" | "system"
  read: boolean
  href: string | null
  createdAt: string | null
}
