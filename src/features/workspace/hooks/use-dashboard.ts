"use client"

import { useQuery } from "@tanstack/react-query"
import type { Role } from "@/features/auth/schemas"
import { readBrowserApi } from "@/infrastructure/api/browser"
import { ApiError } from "@/infrastructure/api/error"
import { dashboardKey } from "../query"
import { dashboardSchema, type DashboardFilters } from "../schemas"

export function useDashboard(
  viewerId: string,
  role: Role,
  filters: DashboardFilters
) {
  return useQuery({
    queryKey: dashboardKey(viewerId, role, filters),
    queryFn: async ({ signal }) => {
      const data = await readBrowserApi(
        "/api/workspace/overview",
        filters.from ? filters : {},
        dashboardSchema,
        signal
      )
      // A session change in another tab must not fill this account's query key.
      if (data.viewerId !== viewerId || data.role !== role)
        throw new ApiError(
          "Your signed-in account changed. Please reopen your workspace.",
          "http",
          401
        )
      return data
    },
  })
}
