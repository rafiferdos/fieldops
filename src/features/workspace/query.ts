import type { Role } from "@/features/auth/schemas"
import type { DashboardFilters } from "./schemas"

// Filters and identity are explicit so two accounts cannot reuse each other's records.
export function dashboardKey(
  viewerId: string,
  role: Role,
  filters: DashboardFilters
) {
  return [
    "workspace",
    "overview",
    viewerId,
    role,
    filters.from,
    filters.to,
  ] as const
}
