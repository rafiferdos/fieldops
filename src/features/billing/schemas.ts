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

export const billingSchema = z.strictObject({
  address: z.string().trim().min(5, "Use at least 5 characters.").max(50),
  city: z.string().trim().min(2, "Enter your city.").max(50),
  postcode: z.string().trim().min(1, "Enter your postcode.").max(30),
})
export const checkoutSchema = z.strictObject({ billing: billingSchema })
export const checkoutIntentSchema = z.strictObject({
  key: z.uuid(),
  billing: billingSchema,
  paymentId: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
})
export type CheckoutIntent = z.infer<typeof checkoutIntentSchema>
export type Billing = z.infer<typeof billingSchema>
export const paymentSchema = z.object({
  id: z.uuid(),
  invoiceId: z.uuid(),
  amountMinor: z.number().int().min(0).max(1000000000),
  currency: z.literal("BDT"),
  gateway: z.literal("SSLCOMMERZ"),
  mode: z.enum(["SANDBOX", "LIVE"]),
  status: z.enum([
    "INITIATING",
    "PENDING",
    "SUCCEEDED",
    "FAILED",
    "CANCELLED",
    "REVIEW",
    "UNKNOWN",
  ]),
  checkoutUrl: z.url().nullable(),
  reviewReason: z.string().nullable(),
  requiresReview: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  verifiedAt: z.iso.datetime().nullable(),
  settledAt: z.iso.datetime().nullable(),
})
export type Payment = z.infer<typeof paymentSchema>

export function invoicePath(role: BillingRole, id: string) {
  return role === "ADMIN"
    ? (`/admin/invoices/${id}` as const)
    : (`/customer/invoices/${id}` as const)
}
