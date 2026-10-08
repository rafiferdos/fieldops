import { getInvoice } from "@/features/billing/server"
import { InvoiceDetails } from "@/features/billing/components/invoice-details"

export const metadata = { title: "Invoice inspection" }
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const invoice = await getInvoice((await params).invoiceId, "ADMIN")
  return <InvoiceDetails invoice={invoice} role="ADMIN" />
}
