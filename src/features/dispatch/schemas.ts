import { z } from "zod"
import { dhakaInstant, dhakaLocal } from "@/features/requests/schemas"
import { writableVersionSchema } from "@/features/work-orders/schemas"
import {
  firstValue,
  pageSchema,
  paginationSchema,
  type SearchValues,
} from "@/shared/lib/list-query"

const visitDate = z.iso
  .datetime({ offset: true })
  .refine(
    (value) => !/\.\d{4,}/.test(value),
    "Use at most millisecond precision."
  )
// Match the backend's future half-open window and eight-hour maximum.
export const windowSchema = z
  .strictObject({ start: visitDate, end: visitDate })
  .refine(
    ({ start, end }) =>
      Date.parse(start) > Date.now() &&
      Date.parse(end) > Date.parse(start) &&
      Date.parse(end) - Date.parse(start) <= 8 * 3600000,
    {
      message: "Choose a future visit lasting no more than eight hours.",
      path: ["end"],
    }
  )
export const assignmentSchema = windowSchema.safeExtend({
  technicianId: z.uuid(),
})
export const scheduleSchema = assignmentSchema.safeExtend({
  version: writableVersionSchema,
})
export const availabilityQuerySchema = windowSchema.safeExtend({
  serviceId: z.uuid(),
  page: z.number().int().min(1).max(100000),
  limit: z.literal(20),
})
export const availabilityPageSchema = z.object({
  items: z.array(z.object({ id: z.uuid(), name: z.string() })).max(20),
  pagination: paginationSchema,
})
export type AvailabilityPage = z.infer<typeof availabilityPageSchema>
export type VisitWindow = z.infer<typeof windowSchema>
export const scheduleFormSchema = z
  .object({ startLocal: z.string(), endLocal: z.string() })
  .superRefine((value, context) => {
    const result = windowSchema.safeParse({
      start: dhakaInstant(value.startLocal),
      end: dhakaInstant(value.endLocal),
    })
    if (!result.success)
      context.addIssue({
        code: "custom",
        path: ["endLocal"],
        message:
          "Choose valid future Dhaka times, ending after the start and within eight hours.",
      })
  })
export const reviewSchema = z.discriminatedUnion("decision", [
  z.strictObject({
    version: writableVersionSchema,
    decision: z.literal("APPROVE"),
  }),
  z.strictObject({
    version: writableVersionSchema,
    decision: z.literal("REJECT"),
    reason: z.string().trim().min(3).max(500),
  }),
])
export const reviewFormSchema = z
  .object({
    decision: z.enum(["APPROVE", "REJECT"]),
    reason: z.string().trim().max(500),
  })
  .refine((value) => value.decision !== "REJECT" || value.reason.length >= 3, {
    path: ["reason"],
    message: "Explain the rejection in 3–500 characters.",
  })

// Scheduling inputs live in the URL so a conflict reload preserves the visit window.
export function parseAvailabilitySearch(values: SearchValues) {
  const result = windowSchema.safeParse({
    start: firstValue(values.start),
    end: firstValue(values.end),
  })
  return result.success
    ? { ...result.data, page: pageSchema.parse(firstValue(values.techPage)) }
    : null
}
export function localWindow(window: VisitWindow | null) {
  return {
    startLocal: window ? dhakaLocal(window.start) : "",
    endLocal: window ? dhakaLocal(window.end) : "",
  }
}
