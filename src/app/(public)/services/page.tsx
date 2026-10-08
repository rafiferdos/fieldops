import { Card } from "@/shared/ui/card"
import Link from "next/link"
import { listServices } from "@/features/services/server"
import { parseServiceQuery } from "@/features/services/schemas"
import { ServiceCard } from "@/features/services/components/service-card"
import type { SearchValues } from "@/shared/lib/list-query"
import { Reveal } from "@/shared/components/reveal"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { ChoiceSelect } from "@/shared/components/choice-select"

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
      <Card className="mb-8 border p-5 shadow-none">
        {/* Keep GET submission semantics while sharing the shadcn filter surface. */}
        <form
          action="/services"
          className="grid items-end gap-4 sm:grid-cols-[1fr_auto_auto_auto]"
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
            <ChoiceSelect
              key={query.sort}
              id="service-sort"
              name="sort"
              defaultValue={query.sort}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "name_asc", label: "Name A–Z" },
                { value: "price_asc", label: "Price: low to high" },
                { value: "price_desc", label: "Price: high to low" },
              ]}
            />
          </div>
          <input type="hidden" name="limit" value={query.limit} />
          <Button type="submit">Apply filters</Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Clear
          </Button>
        </form>
      </Card>
      {result.items.length ? (
        <Reveal
          key={`${query.q}:${query.sort}:${query.page}`}
          stagger
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {result.items.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </Reveal>
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
