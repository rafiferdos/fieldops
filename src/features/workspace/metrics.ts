import {
  CalendarDays,
  CheckCheck,
  Clock3,
  ClipboardList,
  CircleX,
  Truck,
  Wrench,
  Receipt,
  Users,
  Percent,
} from "lucide-react"
import type { StatCardProps } from "@/shared/components/stat-card"
import { formatRevenue } from "@/features/admin/schemas"
import { workListPath } from "@/features/work-orders/routes"
import type { Dashboard } from "./schemas"

export function dashboardMetrics(data: Dashboard): StatCardProps[] {
  const workPath = workListPath(data.role)
  const work = data.work.byStatus
  const common: StatCardProps[] = [
    {
      label: "Total visits",
      value: data.work.total,
      detail: "All work orders you can access",
      icon: CalendarDays,
      tone: "info",
      href: workPath,
    },
    {
      label: "Scheduled",
      value: work.ASSIGNED,
      detail: "Assigned visits awaiting departure",
      icon: Clock3,
      tone: "warning",
      href: `${workPath}?status=ASSIGNED`,
    },
    {
      label: "En route",
      value: work.EN_ROUTE,
      detail: "Travel to the service location has started",
      icon: Truck,
      tone: "info",
      href: `${workPath}?status=EN_ROUTE`,
    },
    {
      label: "In progress",
      value: work.IN_PROGRESS,
      detail: "Service work currently underway",
      icon: Wrench,
      tone: "info",
      href: `${workPath}?status=IN_PROGRESS`,
    },
    {
      label: "Completed visits",
      value: work.COMPLETED,
      detail: "Completed work with a recorded report",
      icon: CheckCheck,
      tone: "positive",
      href: `${workPath}?status=COMPLETED`,
    },
    {
      label: "Cancelled visits",
      value: work.CANCELLED,
      detail: "Cancelled work orders, kept for history",
      icon: CircleX,
      href: `${workPath}?status=CANCELLED`,
    },
  ]
  if (data.role === "TECHNICIAN") return common
  const requestsPath =
    data.role === "ADMIN" ? "/admin/requests" : "/customer/requests"
  if (data.role === "CUSTOMER")
    return [
      {
        label: "My requests",
        value: data.requests.total,
        detail: "All requests submitted by your account",
        icon: ClipboardList,
        tone: "info",
        href: requestsPath,
      },
      {
        label: "Awaiting review",
        value: data.requests.byStatus.PENDING,
        detail: "Waiting for an administrator's decision",
        icon: Clock3,
        tone: "warning",
        href: `${requestsPath}?status=PENDING`,
      },
      ...common,
    ]
  const { overview } = data
  return [
    {
      label: "Verified revenue",
      value: formatRevenue(overview.invoices.verifiedRevenueMinor),
      detail: "Provider-verified settlements in the selected period",
      icon: Receipt,
      tone: "positive",
    },
    {
      label: "Paid invoices",
      value: overview.invoices.paidCount,
      detail: "Settled in the selected period; counted once",
      icon: CheckCheck,
      tone: "positive",
    },
    {
      label: "Period requests",
      value: overview.requests.total,
      detail: "Requests created in the selected period",
      icon: ClipboardList,
      tone: "info",
    },
    {
      label: "Period work orders",
      value: overview.workOrders.total,
      detail: "Work created in the selected period",
      icon: CalendarDays,
      tone: "info",
    },
    {
      label: "Period completions",
      value: overview.workOrders.completed,
      detail: "Completed work from that creation cohort",
      icon: CheckCheck,
      tone: "positive",
    },
    {
      label: "Completion rate",
      value: `${overview.workOrders.completionRate}%`,
      detail: "Completed / all work created in the period",
      icon: Percent,
      tone: "positive",
    },
    {
      label: "Active technicians",
      value: overview.technicians.active,
      detail: `Current accounts out of ${overview.technicians.total} technicians`,
      icon: Users,
      tone: "info",
      href: "/admin/users?role=TECHNICIAN",
    },
    {
      label: "Awaiting review",
      value: data.requests.byStatus.PENDING,
      detail: "Current pending requests across all time",
      icon: Clock3,
      tone: "warning",
      href: "/admin/requests?status=PENDING",
    },
  ]
}
