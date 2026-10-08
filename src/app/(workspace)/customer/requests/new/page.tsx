import { z } from "zod"
import { requireViewer } from "@/features/auth/session"
import { getService, listServices } from "@/features/services/server"
import { RequestWizard } from "@/features/requests/components/request-wizard"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"
import { EmptyState } from "@/shared/components/empty-state"

export const metadata = { title: "New service request" }
export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  const selected = z
    .uuid()
    .safeParse(firstValue((await searchParams).serviceId))
  const selectedId = selected.success ? selected.data : undefined
  await requireViewer(
    "CUSTOMER",
    selectedId
      ? `/customer/requests/new?serviceId=${selectedId}`
      : "/customer/requests/new"
  )
  const catalog = await listServices({
    q: "",
    page: 1,
    limit: 100,
    sort: "name_asc",
  })
  const services = [...catalog.items]
  if (selectedId && !services.some((item) => item.id === selectedId))
    services.push(await getService(selectedId))
  return (
    <>
      <PageHeading
        eyebrow="New request"
        title="Tell us what you need."
        description="Choose your service, share the visit details and review everything before submitting."
      />
      {services.length ? (
        <RequestWizard
          services={services}
          selectedId={selectedId}
          hasMore={catalog.pagination.total > catalog.items.length}
        />
      ) : (
        <EmptyState title="No services available">
          Please return when the catalog has an available service.
        </EmptyState>
      )}
    </>
  )
}
