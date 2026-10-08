import "server-only"
import { notFound } from "next/navigation"
import { z } from "zod"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { requireViewer } from "@/features/auth/session"
import { queryString } from "@/shared/lib/list-query"
import type { parseRequestQuery } from "./schemas"
import { requestPageSchema, requestSchema } from "./schemas"

export async function listRequests(
  query: ReturnType<typeof parseRequestQuery>,
  role: "CUSTOMER" | "ADMIN" = "CUSTOMER"
) {
  // Admin review shares the queue schema, but never inherits customer-only access.
  const { accessToken } = await requireViewer(
    role,
    role === "ADMIN" ? "/admin/requests" : "/customer"
  )
  return (
    await apiRequest(`/requests?${queryString(query)}`, requestPageSchema, {
      accessToken,
    })
  ).data
}
export async function getRequest(
  id: string,
  role: "CUSTOMER" | "ADMIN" = "CUSTOMER"
) {
  if (!z.uuid().safeParse(id).success) notFound()
  const { accessToken } = await requireViewer(
    role,
    role === "ADMIN" ? `/admin/requests/${id}` : `/customer/requests/${id}`
  )
  try {
    return (await apiRequest(`/requests/${id}`, requestSchema, { accessToken }))
      .data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
}
