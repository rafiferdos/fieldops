import Link from "next/link"
import { listServices } from "@/features/services/server"
import { parseServiceQuery } from "@/features/services/schemas"
import { ServiceCard } from "@/features/services/components/service-card"
import type { SearchValues } from "@/shared/lib/list-query"
import { Reveal } from "@/shared/components/reveal"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import { ServiceFilters } from "@/features/services/components/service-filters"

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
      <ServiceFilters pathname="/services" query={query} />
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
