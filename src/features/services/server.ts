import "server-only"
import { notFound } from "next/navigation"
import { cache } from "react"
import { z } from "zod"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { queryString } from "@/shared/lib/list-query"
import type { parseServiceQuery } from "./schemas"
import { servicePageSchema, serviceSchema } from "./schemas"

export async function listServices(
  query: ReturnType<typeof parseServiceQuery>
) {
  return (
    await apiRequest(`/services?${queryString(query)}`, servicePageSchema)
  ).data
}

// Metadata and page composition share one validated read within the same render.
export const getService = cache(async (id: string) => {
  if (!z.uuid().safeParse(id).success) notFound()
  try {
    return (await apiRequest(`/services/${id}`, serviceSchema)).data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
})
