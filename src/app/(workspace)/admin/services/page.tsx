import { requireViewer } from "@/features/auth/session"
import { listServices } from "@/features/services/server"
import { parseServiceQuery } from "@/features/services/schemas"
import { ServiceFilters } from "@/features/services/components/service-filters"
import { ServiceEditor } from "@/features/services/components/service-editor"
import { RemoveServiceDialog } from "@/features/services/components/remove-service-dialog"
import type { SearchValues } from "@/shared/lib/list-query"
import { formatMoney } from "@/shared/lib/format"
import { PageHeading } from "@/shared/components/page-heading"
import { ButtonLink } from "@/shared/components/button-link"
import { EmptyState } from "@/shared/components/empty-state"
import { Pagination } from "@/shared/components/pagination"
import { Card } from "@/shared/ui/card"
import { ContentImage } from "@/shared/components/content-image"

export const metadata = { title: "Manage service catalog" }
export default async function ManageServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  await requireViewer("ADMIN", "/admin/services")
  const query = parseServiceQuery(await searchParams),
    result = await listServices(query)
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Service catalog"
        description="Manage active services and future base prices. Historical work and invoices keep their original amounts."
        action={<ServiceEditor />}
      />
      <ServiceFilters pathname="/admin/services" query={query} />
      {result.items.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {result.items.map((service) => (
            <Card key={service.id} className="min-w-0 border p-6 shadow-none">
              <ContentImage
                src={service.imageUrl}
                alt={service.name}
                className="h-36"
                sizes="(max-width: 1024px) 90vw, 480px"
              />
              <h2 className="font-heading text-xl font-medium break-words">
                {service.name}
              </h2>
              <p className="line-clamp-3 text-sm leading-relaxed break-words text-muted-foreground">
                {service.description}
              </p>
              <p className="font-medium tabular-nums">
                {formatMoney(service.basePriceMinor)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ServiceEditor service={service} />
                <RemoveServiceDialog id={service.id} name={service.name} />
                <ButtonLink variant="ghost" href={`/services/${service.id}`}>
                  View public service
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={query.q ? "No matching services" : "No active services"}
        >
          Create a service or clear filters to inspect the active catalog.
          Deleted entries retain history and are excluded from this API.
        </EmptyState>
      )}
      <Pagination
        pathname="/admin/services"
        query={query}
        {...result.pagination}
      />
    </>
  )
}
