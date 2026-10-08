import "server-only"
import { apiRequest } from "@/infrastructure/api/server"
import { readIntent } from "@/features/billing/intent-store"
import { paymentSchema } from "@/features/billing/schemas"

// The API has no payment history endpoint; inspect the saved attempt when available.
export async function knownPaymentReview(
  customerId: string,
  invoiceId: string,
  accessToken: string
) {
  const intent = await readIntent(customerId, invoiceId)
  if (!intent?.paymentId) return false
  const payment = (
    await apiRequest(`/payments/${intent.paymentId}`, paymentSchema, {
      accessToken,
    })
  ).data
  return payment.requiresReview || payment.status === "REVIEW"
}
