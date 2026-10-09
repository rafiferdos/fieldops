import type { Route } from "next"
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Plus,
  Wrench,
  Users,
  History,
  UserRound,
} from "lucide-react"
import type { Role } from "@/features/auth/schemas"
import { roleHome } from "@/features/auth/policy"

interface WorkspaceLink {
  href: Route
  label: string
  icon: typeof LayoutDashboard
}

export function workspaceLinks(role: Role): WorkspaceLink[] {
  const links: WorkspaceLink[] = [
    { href: roleHome(role), label: "Dashboard", icon: LayoutDashboard },
  ]
  const roleLinks: WorkspaceLink[] =
    role === "CUSTOMER"
      ? [
          {
            href: "/customer/requests",
            label: "My requests",
            icon: ClipboardList,
          },
          { href: "/customer/requests/new", label: "New request", icon: Plus },
          {
            href: "/customer/work-orders",
            label: "Work orders",
            icon: CalendarDays,
          },
        ]
      : role === "TECHNICIAN"
        ? [
            {
              href: "/technician/work-orders",
              label: "Assigned visits",
              icon: CalendarDays,
            },
          ]
        : ([
            { href: "/admin/requests", label: "Requests", icon: ClipboardList },
            {
              href: "/admin/work-orders",
              label: "Work orders",
              icon: CalendarDays,
            },
            { href: "/admin/services", label: "Services", icon: Wrench },
            { href: "/admin/users", label: "Users & skills", icon: Users },
            { href: "/admin/audit-logs", label: "Audit logs", icon: History },
          ] as const)
  return [
    ...links,
    ...roleLinks,
    { href: "/account", label: "Profile & settings", icon: UserRound },
  ] satisfies { href: Route; label: string; icon: typeof LayoutDashboard }[]
}

export function isWorkspaceLinkActive(
  pathname: string,
  href: string,
  role: Role
) {
  if (pathname === href) return true
  // Creation has its own entry, so its parent queue must not also look selected.
  if (pathname === "/customer/requests/new") return false
  return href !== roleHome(role) && pathname.startsWith(`${href}/`)
}
