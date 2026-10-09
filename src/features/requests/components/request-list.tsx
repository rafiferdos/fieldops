import { ButtonLink } from "@/shared/components/button-link"
import Link from "next/link"
import { ArrowUpRight, CalendarDays } from "lucide-react"
import { Reveal } from "@/shared/components/reveal"
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { ChoiceSelect } from "@/shared/components/choice-select"

// Customer and admin queues share presentation; the server read enforces each scope.
export async function RequestList({
  values,
  role,
}: {
  values: SearchValues
  role: "CUSTOMER" | "ADMIN"
}) {
  const pathname = role === "ADMIN" ? "/admin/requests" : "/customer/requests"
  const query = parseRequestQuery(values),
    result = await listRequests(query, role)
  return (
    <>
      <PageHeading
        eyebrow={
          role === "ADMIN" ? "Administrator workspace" : "Customer workspace"
        }
        title={
          role === "ADMIN" ? "Review service requests" : "Your service requests"
        }
        description="Keep track of review decisions and confirmed service visits."
        action={
          role === "CUSTOMER" ? (
            <Link href="/customer/requests/new" className={buttonVariants()}>
              New request
            </Link>
          ) : undefined
        }
      />
      <Card className="mb-8 border p-5 shadow-none">
        {/* Keep GET submission semantics while sharing the shadcn filter surface. */}
        <form
          action={pathname}
          className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]"
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
            <ChoiceSelect
              key={query.status ?? "all"}
              id="request-status"
              name="status"
              defaultValue={query.status ?? ""}
              options={[
                { value: "", label: "All statuses" },
                ...["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(
                  (status) => ({ value: status, label: status })
                ),
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-sort">Sort by</Label>
            <ChoiceSelect
              key={query.sort}
              id="request-sort"
              name="sort"
              defaultValue={query.sort}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "preferred_start_asc", label: "Preferred visit" },
              ]}
            />
          </div>
          {query.serviceId && (
            <input type="hidden" name="serviceId" value={query.serviceId} />
          )}
          <input type="hidden" name="limit" value={query.limit} />
          <Button type="submit">Apply filters</Button>
          <ButtonLink variant="ghost" href={pathname}>
            Clear
          </ButtonLink>
        </form>
      </Card>
      {query.serviceId && (
        <p className="mb-5 text-sm text-muted-foreground">
          Filtered by service.{" "}
          <Link href={pathname} className="underline">
            Clear service filter
          </Link>
        </p>
      )}
      {/* Entry motion never changes record ordering or operational state. */}
      {result.items.length ? (
        <Reveal
          key={`${query.q}:${query.status}:${query.sort}:${query.page}`}
          stagger
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {result.items.map((request) => (
            <Card
              key={request.id}
              className="interactive-card border shadow-none"
            >
              <CardHeader>
                <div className="mb-3">
                  <Badge
                    variant="outline"
                    className="status-badge"
                    data-status={request.status}
                  >
                    {request.status}
                  </Badge>
                </div>
                <CardTitle className="font-heading text-xl">
                  {request.service.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {request.description}
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <CalendarDays
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  Preferred: {formatDate(request.preferredStart)}
                </p>
              </CardContent>
              {/* Fixed footers keep record actions aligned across a queue row. */}
              <CardFooter className="border-t">
                <Link
                  href={
                    role === "ADMIN"
                      ? `/admin/requests/${request.id}`
                      : `/customer/requests/${request.id}`
                  }
                  className="text-link min-h-11 w-full justify-between"
                >
                  View request
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </Reveal>
      ) : (
        <EmptyState
          title={
            query.q || query.status || firstValue(values.serviceId)
              ? "No matching requests"
              : role === "ADMIN"
                ? "No service requests yet"
                : "Your first request starts here"
          }
        >
          <Link
            href={
              query.q || query.status || query.serviceId || role === "ADMIN"
                ? pathname
                : "/customer/requests/new"
            }
            className="underline"
          >
            {query.q || query.status || query.serviceId || role === "ADMIN"
              ? "Clear filters"
              : "Request a service"}
          </Link>
        </EmptyState>
      )}
      <Pagination pathname={pathname} query={query} {...result.pagination} />
    </>
  )
}
