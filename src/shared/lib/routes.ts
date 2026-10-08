import type { Route } from "next"

// Limit action destinations to implemented record families while preserving Next route checks.
export type RecordRoute = Route<
  | `/customer/requests/${string}`
  | `/admin/requests/${string}`
  | `/customer/work-orders/${string}`
  | `/technician/work-orders/${string}`
  | `/admin/work-orders/${string}`
  | `/customer/invoices/${string}`
  | `/admin/invoices/${string}`
>
