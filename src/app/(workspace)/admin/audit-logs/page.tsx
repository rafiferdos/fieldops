import { requireViewer } from "@/features/auth/session"
import { listAuditEvents } from "@/features/admin/audit/server"
import {
  auditQuerySchema,
  parseAuditQuery,
} from "@/features/admin/audit/schemas"
import { AuditFilters } from "@/features/admin/audit/components/audit-filters"
import { AuditList } from "@/features/admin/audit/components/audit-list"
import type { SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"
import { FormMessage } from "@/shared/components/form-message"
import { Pagination } from "@/shared/components/pagination"

export const metadata = { title: "Audit history" }
export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  await requireViewer("ADMIN", "/admin/audit-logs")
  const values = await searchParams,
    parsed = parseAuditQuery(values),
    query = parsed.success ? parsed.data : auditQuerySchema.parse({}),
    result = parsed.success ? await listAuditEvents(query) : null
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Audit history"
        description="Inspect append-only operational events and their safe metadata. Events cannot be edited or removed here."
      />
      <AuditFilters values={values} limit={query.limit} />
      {!parsed.success && (
        <FormMessage message="Check entity/action filters, UUIDs and pagination. Provide both valid dates in increasing order, at most 366 days apart. Clear filters to start again." />
      )}
      {result &&
        (result.items.length ? (
          <AuditList events={result.items} />
        ) : (
          <EmptyState title="No matching audit events">
            Adjust or clear filters to inspect a different part of the history.
          </EmptyState>
        ))}
      {result && (
        <Pagination
          pathname="/admin/audit-logs"
          query={query}
          {...result.pagination}
        />
      )}
    </>
  )
}
