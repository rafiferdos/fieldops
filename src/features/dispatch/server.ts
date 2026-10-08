import "server-only"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { queryString } from "@/shared/lib/list-query"
import {
  availabilityQuerySchema,
  availabilityPageSchema,
  type VisitWindow,
} from "./schemas"

// This read proves current qualification/availability; it does not reserve a slot.
export async function findTechnicians(
  serviceId: string,
  window: VisitWindow,
  page: number
) {
  const query = availabilityQuerySchema.parse({
    serviceId,
    ...window,
    page,
    limit: 20,
  })
  const { accessToken } = await requireViewer("ADMIN")
  return (
    await apiRequest(
      `/technicians?${queryString(query)}`,
      availabilityPageSchema,
      { accessToken }
    )
  ).data
}
