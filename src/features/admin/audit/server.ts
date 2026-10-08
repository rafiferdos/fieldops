import "server-only"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { queryString } from "@/shared/lib/list-query"
import { auditApiQuery, auditPageSchema, type AuditQuery } from "./schemas"

export async function listAuditEvents(query: AuditQuery) {
  const { accessToken } = await requireViewer("ADMIN", "/admin/audit-logs")
  return (
    await apiRequest(
      `/admin/audit-logs?${queryString(auditApiQuery(query))}`,
      auditPageSchema,
      { accessToken }
    )
  ).data
}
