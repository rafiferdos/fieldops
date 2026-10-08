import { FeedbackPanel } from "@/features/feedback/components/feedback-panel"
import { getWorkOrder } from "@/features/work-orders/server"
import { WorkDetails } from "@/features/work-orders/components/work-details"
export const metadata = { title: "Track your service visit" }
export default async function CustomerWorkDetailPage({
  params,
}: {
  params: Promise<{ workOrderId: string }>
}) {
  const work = await getWorkOrder((await params).workOrderId, "CUSTOMER")
  return (
    <>
      <WorkDetails role="CUSTOMER" work={work} />
      <FeedbackPanel work={work} />
    </>
  )
}
