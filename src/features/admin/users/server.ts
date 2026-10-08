import "server-only"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { queryString } from "@/shared/lib/list-query"
import { managedUserPageSchema, type ManagedUsersQuery } from "./schemas"

export async function listManagedUsers(query: ManagedUsersQuery) {
  const { accessToken } = await requireViewer("ADMIN", "/admin/users")
  return (
    await apiRequest(
      `/admin/users?${queryString(query)}`,
      managedUserPageSchema,
      {
        accessToken,
      }
    )
  ).data
}
