import { getPayment } from "../server"
import { invoicePath } from "../schemas"
import { paymentOutcome, safeCheckoutUrl } from "../policy"
import { PageHeading } from "@/shared/components/page-heading"
import { ButtonLink } from "@/shared/components/button-link"
import { Card } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { buttonVariants } from "@/shared/ui/button"
import { formatDate, formatMoney } from "@/shared/lib/format"
import { workDetailPath } from "@/features/work-orders/routes"
import { PaymentRefresh } from "./payment-refresh"

export async function PaymentStatus({ paymentId }: { paymentId: string }) {
  const { payment, invoice, role } = await getPayment(paymentId),
    outcome = paymentOutcome(payment, invoice)
  const checkout =
    role === "CUSTOMER" ? safeCheckoutUrl(payment, invoice) : null
  return (
    <>
      <PageHeading
        eyebrow="Verified billing state"
        title={outcome.title}
        description={outcome.description}
      />
      <Card className="max-w-3xl border p-6 shadow-none sm:p-8">
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline">Attempt: {payment.status}</Badge>
          <Badge variant="outline">Invoice: {invoice.status}</Badge>
          <Badge variant="outline">{payment.mode}</Badge>
          {payment.requiresReview && (
            <Badge variant="destructive">Review required</Badge>
          )}
        </div>
        <p className="font-heading text-3xl tabular-nums">
          {formatMoney(payment.amountMinor)}
        </p>
        <p className="text-sm break-all text-muted-foreground">
          Payment {payment.id}
        </p>
        <p className="text-sm text-muted-foreground">
          Updated {formatDate(payment.updatedAt)}
        </p>
        {payment.settledAt && (
          <p className="text-sm">Settled {formatDate(payment.settledAt)}</p>
        )}
        {/* Preserve the original status tab while the provider returns its own tab to this app. */}
        {checkout && (
          <>
            <a
              href={checkout}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ className: "w-fit" })}
            >
              Open {payment.mode === "SANDBOX" ? "sandbox" : "secure"} checkout
            </a>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Checkout opens in another tab. Keep this page open to check the
              latest status after completing or cancelling checkout. A return
              URL alone does not confirm payment.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-3">
          <PaymentRefresh />
          <ButtonLink variant="ghost" href={invoicePath(role, invoice.id)}>
            View invoice
          </ButtonLink>
          {outcome.kind === "verified" && (
            <ButtonLink href={workDetailPath(role, invoice.workOrderId)}>
              View completed service
            </ButtonLink>
          )}
        </div>
      </Card>
    </>
  )
}
