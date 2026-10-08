import { z } from "zod"
import {
  firstValue,
  limitSchema,
  pageSchema,
  paginationSchema,
  searchSchema,
  type SearchValues,
} from "@/shared/lib/list-query"

export const requestStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
])
const workStatusSchema = z.enum([
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
])
export const requestSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid(),
  serviceId: z.uuid(),
  description: z.string(),
  address: z.string(),
  preferredStart: z.iso.datetime(),
  status: requestStatusSchema,
  version: z.number().int().positive(),
  reviewReason: z.string().nullable(),
  reviewedAt: z.iso.datetime().nullable(),
  cancellationReason: z.string().nullable(),
  cancelledAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  service: z.object({ id: z.uuid(), name: z.string() }),
  workOrder: z
    .object({
      id: z.uuid(),
      status: workStatusSchema,
      version: z.number().int().positive(),
      scheduledStart: z.iso.datetime(),
      scheduledEnd: z.iso.datetime(),
    })
    .nullable(),
})
export type ServiceRequest = z.infer<typeof requestSchema>
export const requestPageSchema = z.object({
  items: z.array(requestSchema).max(100),
  pagination: paginationSchema,
})
export function parseRequestQuery(values: SearchValues) {
  return {
    q: searchSchema.parse(firstValue(values.q) ?? ""),
    page: pageSchema.parse(firstValue(values.page)),
    limit: limitSchema.parse(firstValue(values.limit)),
    sort: z
      .enum(["newest", "oldest", "preferred_start_asc"])
      .catch("newest")
      .parse(firstValue(values.sort)),
    status: requestStatusSchema
      .optional()
      .catch(undefined)
      .parse(firstValue(values.status) || undefined),
    serviceId: z
      .uuid()
      .optional()
      .catch(undefined)
      .parse(firstValue(values.serviceId) || undefined),
  }
}
const visitFields = {
  description: z.string().trim().min(10).max(2000),
  address: z.string().trim().min(10).max(500),
  preferredStart: z.iso
    .datetime({ offset: true })
    .refine(
      (value) => Date.parse(value) > Date.now(),
      "Choose a future visit time."
    ),
}
export const createRequestSchema = z.strictObject({
  serviceId: z.uuid(),
  ...visitFields,
})
export const updateRequestSchema = z.strictObject({
  version: z.number().int().positive(),
  ...visitFields,
})
export const cancelRequestSchema = z.strictObject({
  version: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
})

export function dhakaInstant(local: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)
    ? `${local}:00+06:00`
    : ""
}
export function dhakaLocal(instant: string) {
  return new Date(Date.parse(instant) + 6 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)
}
export const visitFormSchema = z.object({
  description: visitFields.description,
  address: visitFields.address,
  preferredLocal: z
    .string()
    .refine(
      (value) =>
        visitFields.preferredStart.safeParse(dhakaInstant(value)).success,
      "Choose a future visit time in Dhaka."
    ),
})
export const wizardSchema = visitFormSchema.extend({
  serviceId: z.uuid("Choose a service."),
})
export function canCancelRequest(
  request: Pick<ServiceRequest, "status" | "workOrder">
) {
  return (
    (request.status === "PENDING" || request.status === "APPROVED") &&
    (!request.workOrder || request.workOrder.status === "ASSIGNED")
  )
}
