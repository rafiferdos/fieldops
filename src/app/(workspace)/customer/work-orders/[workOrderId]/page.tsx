import { getWorkOrder } from "@/features/work-orders/server"
import { WorkDetails } from "@/features/work-orders/components/work-details"
export const metadata = { title: "Track your service visit" }
export default async function CustomerWorkDetailPage({
  params,
}: {
  params: Promise<{ workOrderId: string }>
}) {
  return (
    <WorkDetails
      role="CUSTOMER"
      work={await getWorkOrder((await params).workOrderId, "CUSTOMER")}
    />
  )
}
