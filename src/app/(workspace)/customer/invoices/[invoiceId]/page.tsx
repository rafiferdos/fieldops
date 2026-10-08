import { getInvoice } from "@/features/billing/server"
import { InvoiceDetails } from "@/features/billing/components/invoice-details"

export const metadata = { title: "Service invoice" }
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const invoice = await getInvoice((await params).invoiceId, "CUSTOMER")
  return <InvoiceDetails invoice={invoice} role="CUSTOMER" />
}
