import { z } from "zod"

const allowedFields: Readonly<Record<string, readonly string[]>> = {
  ADMIN_BOOTSTRAPPED: [],
  TECHNICIAN_BOOTSTRAPPED: [],
  USER_PROFILE_UPDATED: ["updatedFields"],
  USER_ACCESS_UPDATED: ["previousRole", "role", "previousStatus", "status"],
  TECHNICIAN_SKILLS_UPDATED: ["serviceIds"],
  SERVICE_CREATED: ["basePriceMinor", "currency"],
  SERVICE_UPDATED: [
    "updatedFields",
    "previousBasePriceMinor",
    "basePriceMinor",
  ],
  SERVICE_DELETED: [],
  IMAGE_UPLOADED: ["purpose"],
  REQUEST_CREATED: ["serviceId", "status", "version"],
  REQUEST_UPDATED: ["updatedFields", "previousVersion", "version"],
  REQUEST_REVIEWED: ["fromStatus", "toStatus", "previousVersion", "version"],
  REQUEST_CANCELLED: ["fromStatus", "toStatus", "previousVersion", "version"],
  WORK_ORDER_ASSIGNED: [
    "requestId",
    "technicianId",
    "start",
    "end",
    "agreedPriceMinor",
    "currency",
    "version",
  ],
  WORK_ORDER_RESCHEDULED: [
    "previousTechnicianId",
    "technicianId",
    "previousStart",
    "previousEnd",
    "start",
    "end",
    "previousVersion",
    "version",
  ],
  WORK_ORDER_STATUS_CHANGED: [
    "fromStatus",
    "toStatus",
    "previousVersion",
    "version",
  ],
  WORK_ORDER_CANCELLED: [
    "requestId",
    "fromStatus",
    "toStatus",
    "previousVersion",
    "version",
  ],
  WORK_ORDER_COMPLETED: [
    "fromStatus",
    "toStatus",
    "previousVersion",
    "version",
    "invoiceId",
  ],
  INVOICE_ISSUED: ["workOrderId", "amountMinor", "currency", "status"],
  INVOICE_PAID: ["paymentId", "amountMinor", "currency"],
  PAYMENT_INITIATED: ["invoiceId", "amountMinor", "currency", "status"],
  PAYMENT_STATE_CHANGED: ["invoiceId", "fromStatus", "toStatus"],
  PAYMENT_SETTLED: ["invoiceId", "receiptId", "amountMinor", "currency"],
  PAYMENT_RECEIPT_REVIEW: ["invoiceId", "receiptId", "reason"],
  FEEDBACK_SUBMITTED: ["feedbackId", "rating"],
}
const valueSchema = z.union([
  z.string().max(100),
  z.number(),
  z.boolean(),
  z.array(z.string().max(100)).max(100),
])
export type AuditValue = z.infer<typeof valueSchema>

// Defense in depth: unknown actions, credential keys and nested payloads never reach the UI.
export function safeAuditMetadata(action: string, input: unknown) {
  const output: Record<string, AuditValue> = {},
    parsed = z.record(z.string(), z.unknown()).safeParse(input),
    fields = Object.hasOwn(allowedFields, action)
      ? allowedFields[action]
      : undefined
  if (!parsed.success || !fields) return output
  for (const field of fields) {
    if (!Object.hasOwn(parsed.data, field)) continue
    const value = valueSchema.safeParse(parsed.data[field])
    if (value.success) output[field] = value.data
  }
  return output
}
