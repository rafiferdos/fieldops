import Link from "next/link"
import { listServices } from "@/features/services/server"
import { parseServiceQuery } from "@/features/services/schemas"
import { ServiceCard } from "@/features/services/components/service-card"
import type { SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select"

export const metadata = { title: "Services" }
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  const query = parseServiceQuery(await searchParams)
  const result = await listServices(query)
  return (
    <>
      <PageHeading
        eyebrow="Service catalog"
        title="What needs attention?"
        description="Explore available services and their base prices. Choose a service to start your request."
      />
      <form
        action="/services"
        className="mb-8 grid items-end gap-4 rounded-2xl border bg-muted/30 p-5 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor="service-search">Search services</Label>
          <Input
            key={query.q}
            id="service-search"
            name="q"
            maxLength={100}
            defaultValue={query.q}
            placeholder="Search by name or description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-sort">Sort by</Label>
          <NativeSelect
            key={query.sort}
            id="service-sort"
            name="sort"
            defaultValue={query.sort}
          >
            <NativeSelectOption value="newest">Newest first</NativeSelectOption>
            <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
            <NativeSelectOption value="name_asc">Name A–Z</NativeSelectOption>
            <NativeSelectOption value="price_asc">
              Price: low to high
            </NativeSelectOption>
            <NativeSelectOption value="price_desc">
              Price: high to low
            </NativeSelectOption>
          </NativeSelect>
        </div>
        <input type="hidden" name="limit" value={query.limit} />
        <Button type="submit">Apply filters</Button>
        <Link href="/services" className="text-sm underline underline-offset-4">
          Clear
        </Link>
      </form>
      {result.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={query.q ? "No matching services" : "No services available"}
        >
          <Link href="/services" className="underline">
            Clear filters
          </Link>{" "}
          or check back later.
        </EmptyState>
      )}
      <Pagination pathname="/services" query={query} {...result.pagination} />
    </>
  )
}
