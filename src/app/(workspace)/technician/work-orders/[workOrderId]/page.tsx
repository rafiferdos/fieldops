import { getWorkOrder } from "@/features/work-orders/server"
import { WorkDetails } from "@/features/work-orders/components/work-details"
import { WorkActions } from "@/features/work-orders/components/work-actions"
export const metadata = { title: "Assigned visit details" }
export default async function TechnicianWorkDetailPage({
  params,
}: {
  params: Promise<{ workOrderId: string }>
}) {
  const work = await getWorkOrder((await params).workOrderId, "TECHNICIAN")
  return (
    <>
      <WorkDetails role="TECHNICIAN" work={work} />
      {/* Execution needs only current policy state, not the full timeline or customer context. */}
      <WorkActions
        work={{
          id: work.id,
          version: work.version,
          status: work.status,
          request: { status: work.request.status },
        }}
      />
    </>
  )
}
