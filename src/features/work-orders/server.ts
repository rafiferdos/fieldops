import "server-only"
import { z } from "zod"
import { notFound } from "next/navigation"
import type { Role } from "@/features/auth/schemas"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { queryString } from "@/shared/lib/list-query"
import {
  workDetailSchema,
  workPageSchema,
  type parseWorkQuery,
} from "./schemas"
import { workDetailPath, workListPath } from "./routes"

// Enforce the route's role before asking the backend for its scoped work records.
export async function listWorkOrders(
  query: ReturnType<typeof parseWorkQuery>,
  role: Role
) {
  const { accessToken } = await requireViewer(role, workListPath(role))
  return (
    await apiRequest(`/work-orders?${queryString(query)}`, workPageSchema, {
      accessToken,
    })
  ).data
}
export async function getWorkOrder(id: string, role: Role) {
  if (!z.uuid().safeParse(id).success) notFound()
  const { accessToken } = await requireViewer(role, workDetailPath(role, id))
  try {
    return (
      await apiRequest(`/work-orders/${id}`, workDetailSchema, { accessToken })
    ).data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
}
