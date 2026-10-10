import type { ReactNode } from "react"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { createQueryClient } from "@/infrastructure/query/client"
import { ApiError } from "@/infrastructure/api/error"
import { getDemoCredentials } from "@/infrastructure/env/auth"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
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
  // Identify the shared evaluation account on the server; never send its credentials to the browser.
  const isEvaluationAccount =
    getDemoCredentials(role)?.email === viewer.profile.email
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
        {isEvaluationAccount && (
          <Card className="mb-6 gap-0 border shadow-none">
            <CardContent className="space-y-3 py-5">
              <Badge variant="outline">Shared evaluation account</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground">
                These are stored backend records, including demonstration and
                test activity. They are not evidence of real customer usage.
                {role === "ADMIN"
                  ? " As an administrator, you see records across all accounts, not only records created by this account."
                  : " This shared account's history can include activity from other visitors."}{" "}
                Changes use the real API and persist. Please do not enter
                personal information or request a real service.
              </p>
            </CardContent>
          </Card>
        )}
        {children}
      </DashboardView>
    </HydrationBoundary>
  )
}
