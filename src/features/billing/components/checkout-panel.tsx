import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { Card } from "@/shared/ui/card"
import { ButtonLink } from "@/shared/components/button-link"
import { readIntent } from "../intent-store"
import { paymentSchema, type Invoice } from "../schemas"
import { canStartNewAttempt } from "../policy"
import { CheckoutForm } from "./checkout-form"

export async function CheckoutPanel({ invoice }: { invoice: Invoice }) {
  const { profile, accessToken } = await requireViewer("CUSTOMER")
  const intent = await readIntent(profile.id, invoice.id)
  const payment = intent?.paymentId
    ? (
        await apiRequest(`/payments/${intent.paymentId}`, paymentSchema, {
          accessToken,
        })
      ).data
    : null
  return (
    <Card className="mt-8 max-w-3xl border p-6 shadow-none sm:p-8">
      <h2 className="font-heading text-2xl font-medium">
        {invoice.status === "PAID" ? "Payment record" : "Secure checkout"}
      </h2>
      {payment && (
        <ButtonLink variant="outline" href={`/payments/${payment.id}`}>
          View payment status
        </ButtonLink>
      )}
      {invoice.status === "UNPAID" ? (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Recover an uncertain attempt with the same billing. After 15
            seconds, recovery can reconcile its provider reference. It never
            automatically starts another charge.
          </p>
          <CheckoutForm
            key={intent?.key ?? "new"}
            invoiceId={invoice.id}
            intent={intent}
            canReset={!!payment && canStartNewAttempt(payment, invoice)}
          />
          <ButtonLink variant="ghost" href="/account">
            Review account details
          </ButtonLink>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This immutable invoice is paid. No new checkout can be created.
        </p>
      )}
    </Card>
  )
}
