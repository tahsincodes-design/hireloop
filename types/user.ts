export const USER_STATUSES = ["active", "suspended"] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export function isUserStatus(value: unknown): value is UserStatus {
  return USER_STATUSES.some((status) => status === value)
}

export type AuthUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: import("@/lib/roles").UserRole
  status: UserStatus
  createdAt: string | null
  updatedAt: string | null
  emailVerified: boolean
}

/** A user row returned by the platform API (`GET /users`). */
export type PlatformUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: import("@/lib/roles").UserRole
  status: UserStatus
  createdAt: string | null
  updatedAt: string | null
  emailVerified: boolean
  companyName: string | null
  headline: string | null
  location: string | null
}

export type Company = {
  id: string
  name: string
  logo: string | null
  website: string | null
  industry: string | null
  size: string | null
  location: string | null
  description: string | null
  ownerId: string | null
}

export type Profile = {
  id: string
  userId: string
  headline: string | null
  bio: string | null
  location: string | null
  phone: string | null
  website: string | null
  skills: string[]
  education: ProfileEducation[]
  experience: ProfileExperience[]
  resumeUrl: string | null
  resumeName: string | null
  avatarUrl: string | null
  updatedAt: string | null
}

export type ProfileEducation = {
  id: string
  school: string
  degree: string | null
  fieldOfStudy: string | null
  startDate: string | null
  endDate: string | null
}

export type ProfileExperience = {
  id: string
  company: string
  title: string
  location: string | null
  startDate: string | null
  endDate: string | null
  current: boolean
  description: string | null
}
