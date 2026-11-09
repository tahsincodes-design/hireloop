import {
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Flag,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Search,
  Settings,
  User,
  UserRound,
  UserSearch,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@/lib/roles"

export type DashboardNavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** Key used by the shell to inject live counts. */
  badgeKey?: "notifications"
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export const DASHBOARD_NAVIGATION: Record<UserRole, DashboardNavGroup[]> = {
  seeker: [
    {
      label: "Job search",
      items: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Find Jobs",
          href: "/dashboard/seeker/jobs",
          icon: Search,
        },
        {
          title: "My Applications",
          href: "/dashboard/seeker/applications",
          icon: FileText,
        },
        {
          title: "Saved Jobs",
          href: "/dashboard/seeker/saved-jobs",
          icon: Bookmark,
        },
        {
          title: "Interviews",
          href: "/dashboard/seeker/interviews",
          icon: CalendarDays,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "My Profile",
          href: "/dashboard/seeker/profile",
          icon: UserRound,
        },
        {
          title: "Resume / CV",
          href: "/dashboard/seeker/resume",
          icon: ClipboardList,
        },
        {
          title: "Notifications",
          href: "/dashboard/seeker/notifications",
          icon: Bell,
          badgeKey: "notifications",
        },
        {
          title: "Settings",
          href: "/dashboard/seeker/settings",
          icon: Settings,
        },
      ],
    },
  ],
  recruiter: [
    {
      label: "Recruiting",
      items: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "My Jobs",
          href: "/dashboard/recruiter/jobs",
          icon: Briefcase,
        },
        {
          title: "Post a Job",
          href: "/dashboard/recruiter/jobs/new",
          icon: PlusCircle,
        },
        {
          title: "Applicants",
          href: "/dashboard/recruiter/applicants",
          icon: Users,
        },
        {
          title: "Candidates",
          href: "/dashboard/recruiter/candidates",
          icon: UserSearch,
        },
        {
          title: "Interviews",
          href: "/dashboard/recruiter/interviews",
          icon: CalendarDays,
        },
      ],
    },
    {
      label: "Workspace",
      items: [
        {
          title: "Company Profile",
          href: "/dashboard/recruiter/company",
          icon: Building2,
        },
        {
          title: "Notifications",
          href: "/dashboard/recruiter/notifications",
          icon: Bell,
          badgeKey: "notifications",
        },
        {
          title: "Settings",
          href: "/dashboard/recruiter/settings",
          icon: Settings,
        },
      ],
    },
  ],
  admin: [
    {
      label: "Platform",
      items: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "User Management",
          href: "/dashboard/admin/users",
          icon: Users,
        },
        {
          title: "Job Management",
          href: "/dashboard/admin/jobs",
          icon: Briefcase,
        },
        {
          title: "Applications",
          href: "/dashboard/admin/applications",
          icon: ListChecks,
        },
        {
          title: "Recruiters",
          href: "/dashboard/admin/recruiters",
          icon: Building2,
        },
        {
          title: "Job Seekers",
          href: "/dashboard/admin/seekers",
          icon: UserRound,
        },
      ],
    },
    {
      label: "Insights",
      items: [
        {
          title: "Reports & Moderation",
          href: "/dashboard/admin/reports",
          icon: Flag,
        },
        {
          title: "Analytics",
          href: "/dashboard/admin/analytics",
          icon: ChartNoAxesCombined,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "Notifications",
          href: "/dashboard/admin/notifications",
          icon: Bell,
          badgeKey: "notifications",
        },
        {
          title: "Settings",
          href: "/dashboard/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

export const ROLE_META: Record<
  UserRole,
  {
    label: string
    description: string
    badgeClassName: string
    accentClassName: string
  }
> = {
  seeker: {
    label: "Job Seeker",
    description:
      "Track applications, discover roles that fit your skills, and stay ready for interviews.",
    badgeClassName:
      "border-sky-400/20 bg-sky-400/10 text-sky-300 hover:bg-sky-400/10",
    accentClassName: "from-sky-500/20 via-indigo-500/10 to-transparent",
  },
  recruiter: {
    label: "Recruiter",
    description:
      "Publish roles, review candidates, and keep every hiring pipeline moving.",
    badgeClassName:
      "border-violet-400/20 bg-violet-400/10 text-violet-300 hover:bg-violet-400/10",
    accentClassName: "from-violet-500/20 via-indigo-500/10 to-transparent",
  },
  admin: {
    label: "Administrator",
    description:
      "Monitor platform health, moderate listings, and manage every HireLoop account.",
    badgeClassName:
      "border-amber-400/20 bg-amber-400/10 text-amber-300 hover:bg-amber-400/10",
    accentClassName: "from-amber-500/20 via-orange-500/10 to-transparent",
  },
}

export const QUICK_ACTIONS: Record<
  UserRole,
  { title: string; description: string; href: string; icon: LucideIcon }[]
> = {
  seeker: [
    {
      title: "Browse Jobs",
      description: "Explore new roles matched to your profile.",
      href: "/dashboard/seeker/jobs",
      icon: Search,
    },
    {
      title: "Update Profile",
      description: "Keep your headline and skills current.",
      href: "/dashboard/seeker/profile",
      icon: User,
    },
    {
      title: "Upload Resume",
      description: "Attach the latest version of your CV.",
      href: "/dashboard/seeker/resume",
      icon: FileText,
    },
    {
      title: "View Applications",
      description: "Follow every application status.",
      href: "/dashboard/seeker/applications",
      icon: ListChecks,
    },
    {
      title: "Saved Jobs",
      description: "Revisit roles you bookmarked.",
      href: "/dashboard/seeker/saved-jobs",
      icon: Bookmark,
    },
  ],
  recruiter: [
    {
      title: "Post a New Job",
      description: "Publish a role to the marketplace.",
      href: "/dashboard/recruiter/jobs/new",
      icon: PlusCircle,
    },
    {
      title: "Manage Jobs",
      description: "Edit, pause, or close your listings.",
      href: "/dashboard/recruiter/jobs",
      icon: Briefcase,
    },
    {
      title: "Browse Candidates",
      description: "Discover talent for your open roles.",
      href: "/dashboard/recruiter/candidates",
      icon: UserSearch,
    },
    {
      title: "View Applications",
      description: "Review candidates and update stages.",
      href: "/dashboard/recruiter/applicants",
      icon: Users,
    },
    {
      title: "Schedule Interview",
      description: "Book time with shortlisted candidates.",
      href: "/dashboard/recruiter/interviews",
      icon: CalendarDays,
    },
  ],
  admin: [
    {
      title: "Manage Users",
      description: "Change roles and moderate accounts.",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Review Jobs",
      description: "Moderate the platform job catalogue.",
      href: "/dashboard/admin/jobs",
      icon: Briefcase,
    },
    {
      title: "View Reports",
      description: "Handle flagged users and listings.",
      href: "/dashboard/admin/reports",
      icon: Flag,
    },
    {
      title: "Platform Analytics",
      description: "Inspect growth and activity trends.",
      href: "/dashboard/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      description: "Review platform connection settings.",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
}

export function getNavigationForRole(role: UserRole) {
  return DASHBOARD_NAVIGATION[role]
}

export function getFlatNavigation(role: UserRole) {
  return DASHBOARD_NAVIGATION[role].flatMap((group) => group.items)
}

export function getPageTitle(role: UserRole, pathname: string) {
  const items = getFlatNavigation(role)
  const exact = items.find((item) => item.href === pathname)
  if (exact) return exact.title

  const nested = items
    .filter(
      (item) =>
        item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (nested) return nested.title

  if (pathname === "/dashboard") {
    return ROLE_META[role].label === "Administrator"
      ? "Platform Overview"
      : "Overview"
  }

  const fallback = pathname.split("/").filter(Boolean).pop()
  if (!fallback) return "Dashboard"
  return fallback
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
