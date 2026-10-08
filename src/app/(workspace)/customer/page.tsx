import Link from "next/link"
import { requireViewer } from "@/features/auth/session"
import { listRequests } from "@/features/requests/server"
import { parseRequestQuery } from "@/features/requests/schemas"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import { formatDate } from "@/shared/lib/format"
import { Button, buttonVariants } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select"

export const metadata = { title: "My requests" }
export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  await requireViewer("CUSTOMER", "/customer")
  const values = await searchParams,
    query = parseRequestQuery(values),
    result = await listRequests(query)
  return (
    <>
      <PageHeading
        eyebrow="Customer workspace"
        title="Your service requests"
        description="Keep track of review decisions and confirmed service visits."
        action={
          <Link href="/customer/requests/new" className={buttonVariants()}>
            New request
          </Link>
        }
      />
      <form
        action="/customer"
        className="mb-8 grid items-end gap-4 rounded-2xl border p-5 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor="request-search">Search requests</Label>
          <Input
            key={query.q}
            id="request-search"
            name="q"
            maxLength={100}
            defaultValue={query.q}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="request-status">Status</Label>
          <NativeSelect
            key={query.status ?? "all"}
            id="request-status"
            name="status"
            defaultValue={query.status ?? ""}
          >
            <NativeSelectOption value="">All statuses</NativeSelectOption>
            {["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
              <NativeSelectOption key={status} value={status}>
                {status}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="request-sort">Sort by</Label>
          <NativeSelect
            key={query.sort}
            id="request-sort"
            name="sort"
            defaultValue={query.sort}
          >
            <NativeSelectOption value="newest">Newest first</NativeSelectOption>
            <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
            <NativeSelectOption value="preferred_start_asc">
              Preferred visit
            </NativeSelectOption>
          </NativeSelect>
        </div>
        {query.serviceId && (
          <input type="hidden" name="serviceId" value={query.serviceId} />
        )}
        <input type="hidden" name="limit" value={query.limit} />
        <Button type="submit">Apply filters</Button>
        <Link href="/customer" className="text-sm underline">
          Clear
        </Link>
      </form>
      {query.serviceId && (
        <p className="mb-5 text-sm text-muted-foreground">
          Filtered by service.{" "}
          <Link href="/customer" className="underline">
            Clear service filter
          </Link>
        </p>
      )}
      {result.items.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {result.items.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="mb-3">
                  <Badge variant="secondary">{request.status}</Badge>
                </div>
                <CardTitle className="font-heading text-xl">
                  {request.service.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {request.description}
                </p>
                <p className="text-sm">
                  Preferred: {formatDate(request.preferredStart)}
                </p>
                <Link
                  href={`/customer/requests/${request.id}`}
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  View request
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            query.q || query.status || firstValue(values.serviceId)
              ? "No matching requests"
              : "Your first request starts here"
          }
        >
          <Link
            href={
              query.q || query.status || query.serviceId
                ? "/customer"
                : "/customer/requests/new"
            }
            className="underline"
          >
            {query.q || query.status || query.serviceId
              ? "Clear filters"
              : "Request a service"}
          </Link>
        </EmptyState>
      )}
      <Pagination pathname="/customer" query={query} {...result.pagination} />
    </>
  )
}
