import { z } from "zod"
import { invoiceSchema } from "@/features/billing/schemas"
import { requestStatusSchema } from "@/features/requests/schemas"
import {
  firstValue,
  searchSchema,
  pageSchema,
  limitSchema,
  paginationSchema,
  type SearchValues,
} from "@/shared/lib/list-query"
import { workStatusSchema } from "./status"

export const writableVersionSchema = z.number().int().min(1).max(2147483646)
const storedVersion = z.number().int().min(1).max(2147483647)

const feedbackSchema = z.object({
  id: z.uuid(),
  workOrderId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.iso.datetime(),
})
export const workOrderSchema = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  technicianId: z.uuid(),
  status: workStatusSchema,
  version: storedVersion,
  scheduledStart: z.iso.datetime(),
  scheduledEnd: z.iso.datetime(),
  agreedPriceMinor: z.number().int().min(0).max(1000000000),
  currency: z.literal("BDT"),
  completedAt: z.iso.datetime().nullable(),
  report: z.string().nullable(),
  cancelledAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  technician: z.object({ id: z.uuid(), name: z.string() }),
  request: z.object({
    id: z.uuid(),
    customerId: z.uuid(),
    serviceId: z.uuid(),
    status: requestStatusSchema,
    version: storedVersion,
    description: z.string(),
    address: z.string(),
    service: z.object({ id: z.uuid(), name: z.string() }),
  }),
  invoice: invoiceSchema.nullable(),
  feedback: feedbackSchema.nullable(),
})
export type WorkOrder = z.infer<typeof workOrderSchema>
export const timelineEntrySchema = z.object({
  id: z.uuid(),
  action: z.string(),
  createdAt: z.iso.datetime(),
  // Only known transition fields cross the rendering boundary; arbitrary audit data stays out.
  metadata: z
    .object({
      fromStatus: workStatusSchema.optional(),
      toStatus: workStatusSchema.optional(),
    })
    .nullable(),
})
export const workDetailSchema = workOrderSchema.extend({
  // Parse only the safe fields displayed; audit metadata is not executable UI.
  timeline: z.array(timelineEntrySchema).max(100),
})
export type WorkDetail = z.infer<typeof workDetailSchema>
export const workPageSchema = z.object({
  items: z.array(workOrderSchema).max(100),
  pagination: paginationSchema,
})

// Backend scoping is authoritative; URL input cannot choose an owner or technician.
export function parseWorkQuery(
  values: SearchValues,
  defaultSort: "newest" | "scheduled_start_asc" = "newest"
) {
  return {
    q: searchSchema.parse(firstValue(values.q) ?? ""),
    page: pageSchema.parse(firstValue(values.page)),
    limit: limitSchema.parse(firstValue(values.limit)),
    status: workStatusSchema
      .optional()
      .catch(undefined)
      .parse(firstValue(values.status) || undefined),
    serviceId: z
      .uuid()
      .optional()
      .catch(undefined)
      .parse(firstValue(values.serviceId) || undefined),
    sort: z
      .enum(["newest", "oldest", "scheduled_start_asc"])
      .catch(defaultSort)
      .parse(firstValue(values.sort)),
  }
}
export const progressSchema = z.strictObject({
  version: writableVersionSchema,
  status: z.enum(["EN_ROUTE", "IN_PROGRESS"]),
})
export const completionSchema = z.strictObject({
  version: writableVersionSchema,
  report: z
    .string()
    .trim()
    .min(10, "Describe the completed work in at least 10 characters.")
    .max(2000, "Keep the completion report within 2000 characters."),
})
export const reportFormSchema = completionSchema.omit({ version: true })
