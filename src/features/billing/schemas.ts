import { z } from "zod"

// This immutable snapshot is shared with nested work summaries, including technician reads.
export const invoiceSchema = z.object({
  id: z.uuid(),
  workOrderId: z.uuid(),
  customerId: z.uuid(),
  amountMinor: z.number().int().min(0).max(1000000000),
  currency: z.literal("BDT"),
  status: z.enum(["UNPAID", "PAID"]),
  issuedAt: z.iso.datetime(),
  paidAt: z.iso.datetime().nullable(),
})
export type Invoice = z.infer<typeof invoiceSchema>
export type BillingRole = "CUSTOMER" | "ADMIN"

export function invoicePath(role: BillingRole, id: string) {
  return role === "ADMIN"
    ? (`/admin/invoices/${id}` as const)
    : (`/customer/invoices/${id}` as const)
}
