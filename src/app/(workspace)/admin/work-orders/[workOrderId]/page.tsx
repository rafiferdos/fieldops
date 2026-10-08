import { getWorkOrder } from "@/features/work-orders/server"
import { WorkDetails } from "@/features/work-orders/components/work-details"
import { SchedulingPanel } from "@/features/dispatch/components/scheduling-panel"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "Work dispatch details" }
export default async function AdminWorkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ workOrderId: string }>
  searchParams: Promise<SearchValues>
}) {
  const work = await getWorkOrder((await params).workOrderId, "ADMIN")
  return (
    <>
      <WorkDetails work={work} role="ADMIN" />
      {work.status === "ASSIGNED" && work.request.status === "APPROVED" && (
        <SchedulingPanel
          target={{ kind: "reschedule", id: work.id, version: work.version }}
          serviceId={work.request.serviceId}
          pathname={`/admin/work-orders/${work.id}`}
          values={await searchParams}
        />
      )}
    </>
  )
}
