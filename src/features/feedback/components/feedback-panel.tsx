import type { WorkDetail } from "@/features/work-orders/schemas"
import { requireViewer } from "@/features/auth/session"
import { Card } from "@/shared/ui/card"
import { feedbackEligible } from "../schemas"
import { knownPaymentReview } from "../server"
import { FeedbackForm } from "./feedback-form"

export async function FeedbackPanel({ work }: { work: WorkDetail }) {
  if (!feedbackEligible(work) || !work.invoice) return null
  const { profile, accessToken } = await requireViewer("CUSTOMER")
  if (await knownPaymentReview(profile.id, work.invoice.id, accessToken))
    return (
      <Card className="mt-8 max-w-3xl p-6">
        <p>Feedback is unavailable while this payment needs review.</p>
      </Card>
    )
  return <FeedbackForm workOrderId={work.id} />
}
