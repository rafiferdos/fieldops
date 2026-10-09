import type { ReactNode } from "react"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { createQueryClient } from "@/infrastructure/query/client"
import { ApiError } from "@/infrastructure/api/error"
import { requireViewer } from "@/features/auth/session"
import { roleHome } from "@/features/auth/policy"
import type { Role } from "@/features/auth/schemas"
import { getDashboard } from "../server"
import { dashboardKey } from "../query"
import { emptyDashboardFilters, type DashboardFilters } from "../schemas"
import { DashboardView } from "./dashboard"

export async function DashboardServer({
  role,
  filters = emptyDashboardFilters,
  children,
}: {
  role: Role
  filters?: DashboardFilters
  children?: ReactNode
}) {
  const viewer = await requireViewer(role, roleHome(role))
  const client = createQueryClient()
  let initialFailure: string | undefined
  // Prefetch on this request; hydrated client reads own every displayed dashboard value.
  try {
    await client.fetchQuery({
      queryKey: dashboardKey(viewer.profile.id, role, filters),
      queryFn: () => getDashboard(viewer, filters),
    })
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    // A cold or unavailable API keeps navigation usable; client reads can recover.
    initialFailure =
      "Live records could not be loaded. Try refreshing your dashboard."
  }
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <DashboardView
        profile={viewer.profile}
        filters={filters}
        initialFailure={initialFailure}
      >
        {children}
      </DashboardView>
    </HydrationBoundary>
  )
}
