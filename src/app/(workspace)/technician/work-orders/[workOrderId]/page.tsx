import { getWorkOrder } from "@/features/work-orders/server"
import { WorkDetails } from "@/features/work-orders/components/work-details"
export const metadata = { title: "Assigned visit details" }
export default async function TechnicianWorkDetailPage({
  params,
}: {
  params: Promise<{ workOrderId: string }>
}) {
  return (
    <WorkDetails
      role="TECHNICIAN"
      work={await getWorkOrder((await params).workOrderId, "TECHNICIAN")}
    />
  )
}
