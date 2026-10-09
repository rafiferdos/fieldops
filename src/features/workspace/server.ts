import "server-only"

import { apiRequest } from "@/infrastructure/api/server"
import { overviewApiQuery, overviewSchema } from "@/features/admin/schemas"
import {
  requestPageSchema,
  requestStatusSchema,
} from "@/features/requests/schemas"
import { workPageSchema } from "@/features/work-orders/schemas"
import { workStatusSchema } from "@/features/work-orders/status"
import type { getViewer } from "@/features/auth/session"
import { queryString } from "@/shared/lib/list-query"
import { dashboardSchema, type DashboardFilters } from "./schemas"

type Viewer = NonNullable<Awaited<ReturnType<typeof getViewer>>>

async function workSummary(accessToken: string, signal?: AbortSignal) {
  const options = { accessToken, ...(signal ? { signal } : {}) }
  const [page, counts] = await Promise.all([
    apiRequest("/work-orders?limit=5&sort=newest", workPageSchema, options),
    Promise.all(
      workStatusSchema.options.map(async (status) => {
        const result = await apiRequest(
          `/work-orders?limit=1&status=${status}`,
          workPageSchema,
          options
        )
        return [status, result.data.pagination.total] as const
      })
    ),
  ])
  // Keep status identity attached to each count instead of depending on enum ordering.
  const byStatus = dashboardSchema.options[1].shape.work.shape.byStatus.parse(
    Object.fromEntries(counts)
  )
  return {
    total: page.data.pagination.total,
    recent: page.data.items,
    byStatus,
  }
}

async function requestSummary(accessToken: string, signal?: AbortSignal) {
  const options = { accessToken, ...(signal ? { signal } : {}) }
  const [page, counts] = await Promise.all([
    apiRequest("/requests?limit=5&sort=newest", requestPageSchema, options),
    Promise.all(
      requestStatusSchema.options.map(async (status) => {
        const result = await apiRequest(
          `/requests?limit=1&status=${status}`,
          requestPageSchema,
          options
        )
        return [status, result.data.pagination.total] as const
      })
    ),
  ])
  const byStatus =
    dashboardSchema.options[0].shape.requests.shape.byStatus.parse(
      Object.fromEntries(counts)
    )
  return {
    total: page.data.pagination.total,
    recent: page.data.items,
    byStatus,
  }
}

export async function getDashboard(
  viewer: Viewer,
  filters: DashboardFilters,
  signal?: AbortSignal
) {
  const { profile, accessToken } = viewer
  const workRead = workSummary(accessToken, signal)
  if (profile.role === "TECHNICIAN") {
    const work = await workRead
    return dashboardSchema.parse({
      role: profile.role,
      viewerId: profile.id,
      capturedAt: new Date().toISOString(),
      work,
    })
  }
  const [work, requests, overview] = await Promise.all([
    workRead,
    requestSummary(accessToken, signal),
    profile.role === "ADMIN"
      ? apiRequest(
          `/admin/overview?${queryString(overviewApiQuery(filters))}`,
          overviewSchema,
          { accessToken, ...(signal ? { signal } : {}) }
        ).then((result) => result.data)
      : undefined,
  ])
  return dashboardSchema.parse({
    role: profile.role,
    viewerId: profile.id,
    capturedAt: new Date().toISOString(),
    work,
    requests,
    ...(overview ? { overview } : {}),
  })
}
