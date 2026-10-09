import type { Role } from "@/features/auth/schemas"
import type { RecordRoute } from "@/shared/lib/routes"

export function workListPath(role: Role) {
  if (role === "CUSTOMER") return "/customer/work-orders"
  if (role === "TECHNICIAN") return "/technician/work-orders"
  return "/admin/work-orders"
}
export function workDetailPath(role: Role, id: string): RecordRoute {
  if (role === "CUSTOMER") return `/customer/work-orders/${id}`
  if (role === "TECHNICIAN") return `/technician/work-orders/${id}`
  return `/admin/work-orders/${id}`
}
