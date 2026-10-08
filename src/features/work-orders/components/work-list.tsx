import Link from "next/link"
import { ArrowUpRight, CalendarDays } from "lucide-react"
import { Reveal } from "@/shared/components/reveal"
import type { Role } from "@/features/auth/schemas"
import type { SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"
import { Pagination } from "@/shared/components/pagination"
import { EmptyState } from "@/shared/components/empty-state"
import { formatDate } from "@/shared/lib/format"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { ChoiceSelect } from "@/shared/components/choice-select"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/ui/card"
import { parseWorkQuery } from "../schemas"
import { workStatusSchema } from "../status"
import { listWorkOrders } from "../server"
import { workListPath, workDetailPath } from "../routes"

// All roles share filters and cards; the backend supplies only their permitted records.
export async function WorkList({
  role,
  values,
}: {
  role: Role
  values: SearchValues
}) {
  const pathname = workListPath(role),
    query = parseWorkQuery(
      values,
      role === "TECHNICIAN" ? "scheduled_start_asc" : "newest"
    )
  const result = await listWorkOrders(query, role)
  return (
    <>
      <PageHeading
        eyebrow={`${role.toLowerCase()} workspace`}
        title={
          role === "TECHNICIAN"
            ? "Your assigned visits"
            : role === "CUSTOMER"
              ? "Your work orders"
              : "Dispatch follow-up"
        }
        description="Follow confirmed visits, service progress and completion records."
      />
      {/* GET filters reset pagination while preserving an explicit service scope. */}
      <Card className="mb-8 border p-5 shadow-none">
        {/* Keep GET submission semantics while sharing the shadcn filter surface. */}
        <form
          action={pathname}
          className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor="work-search">Search work orders</Label>
            <Input
              key={query.q}
              id="work-search"
              name="q"
              defaultValue={query.q}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-status">Work status</Label>
            <ChoiceSelect
              key={query.status ?? "all"}
              id="work-status"
              name="status"
              defaultValue={query.status ?? ""}
              options={[
                { value: "", label: "All statuses" },
                ...workStatusSchema.options.map((status) => ({
                  value: status,
                  label: status,
                })),
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-sort">Sort by</Label>
            <ChoiceSelect
              key={query.sort}
              id="work-sort"
              name="sort"
              defaultValue={query.sort}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "scheduled_start_asc", label: "Scheduled visit" },
              ]}
            />
          </div>
          {query.serviceId && (
            <input type="hidden" name="serviceId" value={query.serviceId} />
          )}
          <input type="hidden" name="limit" value={query.limit} />
          <Button type="submit">Apply filters</Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={pathname} />}
          >
            Clear
          </Button>
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
          {result.items.map((work) => (
            <Card key={work.id} className="interactive-card border shadow-none">
              <CardHeader>
                <div className="mb-3">
                  <Badge
                    variant="outline"
                    className="status-badge"
                    data-status={work.status}
                  >
                    {work.status}
                  </Badge>
                </div>
                <CardTitle className="font-heading text-xl">
                  {work.request.service.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {work.request.description}
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <CalendarDays
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  {formatDate(work.scheduledStart)}
                </p>
                <p className="text-sm">Technician: {work.technician.name}</p>
              </CardContent>
              {/* Fixed footers keep record actions aligned across a queue row. */}
              <CardFooter className="border-t">
                <Link
                  href={workDetailPath(role, work.id)}
                  className="text-link min-h-11 w-full justify-between"
                >
                  View work order
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </Reveal>
      ) : (
        <EmptyState
          title={
            query.q || query.status || query.serviceId
              ? "No matching work orders"
              : "No work orders yet"
          }
        >
          <p>Confirmed assignments will appear here.</p>
        </EmptyState>
      )}
      <Pagination pathname={pathname} query={query} {...result.pagination} />
    </>
  )
}
