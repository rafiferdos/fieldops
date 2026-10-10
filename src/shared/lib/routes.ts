import type { Route } from "next"

export type ListRoute =
  | "/services"
  | "/admin/services"
  | "/admin/users"
  | "/admin/audit-logs"
  | "/customer/requests"
  | "/admin/requests"
  | "/admin/work-orders"
  | "/customer/work-orders"
  | "/technician/work-orders"

// Limit action destinations to implemented record families while preserving Next route checks.
export type RecordRoute = Route<
  | `/customer/requests/${string}`
  | `/admin/requests/${string}`
  | `/customer/work-orders/${string}`
  | `/technician/work-orders/${string}`
  | `/admin/work-orders/${string}`
  | `/customer/invoices/${string}`
  | `/admin/invoices/${string}`
  | `/payments/${string}`
>
