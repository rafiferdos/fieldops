import { Receipt } from "lucide-react"
import { PageHeading } from "@/shared/components/page-heading"
import { ButtonLink } from "@/shared/components/button-link"
import { DetailPanel } from "@/shared/components/detail-panel"
import { Card } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { formatDate, formatMoney } from "@/shared/lib/format"
import { workDetailPath } from "@/features/work-orders/routes"
import type { BillingRole, Invoice } from "../schemas"

export function InvoiceDetails({
  invoice,
  role,
}: {
  invoice: Invoice
  role: BillingRole
}) {
  return (
    <>
      <PageHeading
        eyebrow="Billing"
        title="Your service invoice"
        description={`Invoice ${invoice.id}`}
        action={
          <ButtonLink
            variant="outline"
            href={workDetailPath(role, invoice.workOrderId)}
          >
            View work order
          </ButtonLink>
        }
      />
      <Card className="max-w-3xl border p-6 shadow-none sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <Receipt aria-hidden="true" className="size-6 text-brand-ink" />
          <Badge variant="outline">{invoice.status}</Badge>
        </div>
        <p className="font-heading text-4xl font-medium tracking-tight tabular-nums">
          {formatMoney(invoice.amountMinor)}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Issued {formatDate(invoice.issuedAt)}. The amount was frozen when the
          work was completed. Later catalog prices do not change this invoice.
        </p>
      </Card>
      <DetailPanel className="mt-6 max-w-3xl">
        <div>
          <dt className="text-sm text-muted-foreground">Currency</dt>
          <dd className="mt-2">{invoice.currency}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Payment</dt>
          <dd className="mt-2">
            {invoice.paidAt
              ? `Paid ${formatDate(invoice.paidAt)}`
              : "Awaiting verified payment"}
          </dd>
        </div>
      </DetailPanel>
    </>
  )
}
