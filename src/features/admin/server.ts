import "server-only"
import type { z } from "zod"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { queryString } from "@/shared/lib/list-query"
import {
  overviewApiQuery,
  overviewSchema,
  type overviewFilterSchema,
} from "./schemas"

export async function getOverview(
  filters: z.infer<typeof overviewFilterSchema>
) {
  const { accessToken } = await requireViewer("ADMIN", "/admin")
  return (
    await apiRequest(
      `/admin/overview?${queryString(overviewApiQuery(filters))}`,
      overviewSchema,
      { accessToken }
    )
  ).data
}
