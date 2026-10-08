import { requireViewer } from "@/features/auth/session"
import { listManagedUsers } from "@/features/admin/users/server"
import {
  managedUsersQuerySchema,
  parseManagedUsersQuery,
} from "@/features/admin/users/schemas"
import { UserFilters } from "@/features/admin/users/components/user-filters"
import { UserList } from "@/features/admin/users/components/user-list"
import type { SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"
import { FormMessage } from "@/shared/components/form-message"
import { Pagination } from "@/shared/components/pagination"

export const metadata = { title: "Manage users" }
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  const { profile } = await requireViewer("ADMIN", "/admin/users"),
    values = await searchParams,
    parsed = parseManagedUsersQuery(values),
    query = parsed.success ? parsed.data : managedUsersQuerySchema.parse({}),
    result = parsed.success ? await listManagedUsers(query) : null
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="User directory"
        description="Manage primary roles and account access. Every actual change revokes existing sessions and preserves account history."
      />
      <UserFilters values={values} limit={query.limit} />
      {!parsed.success && (
        <FormMessage message="Use a valid role/status, search within 100 characters and pagination within supported bounds. Clear filters to start again." />
      )}
      {result &&
        (result.items.length ? (
          <UserList users={result.items} query={query} viewerId={profile.id} />
        ) : (
          <EmptyState title="No matching users">
            Clear or adjust filters to inspect non-deleted accounts.
          </EmptyState>
        ))}
      {result && (
        <Pagination
          pathname="/admin/users"
          query={query}
          {...result.pagination}
        />
      )}
    </>
  )
}
