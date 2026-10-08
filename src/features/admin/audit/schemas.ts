import { z } from "zod"
import { paginationSchema, type SearchValues } from "@/shared/lib/list-query"
import { adminPaginationShape } from "../query"
import { overviewApiQuery, overviewFilterSchema } from "../schemas"
import { safeAuditMetadata } from "./metadata"

const entityTypeSchema = z.enum([
  "USER",
  "SERVICE",
  "REQUEST",
  "WORK_ORDER",
  "INVOICE",
  "PAYMENT",
])
const actionSchema = z
  .string()
  .trim()
  .regex(/^[A-Z][A-Z_]{0,79}$/)
const optionalId = z
  .uuid()
  .or(z.literal(""))
  .optional()
  .transform((value) => (value ? value.toLowerCase() : undefined))
export const auditQuerySchema = z
  .strictObject({
    ...adminPaginationShape,
    entityType: entityTypeSchema
      .or(z.literal(""))
      .optional()
      .transform((value) => value || undefined),
    entityId: optionalId,
    actorId: optionalId,
    action: actionSchema
      .or(z.literal(""))
      .optional()
      .transform((value) => value || undefined),
    from: overviewFilterSchema.shape.from.default(""),
    to: overviewFilterSchema.shape.to.default(""),
  })
  .refine(
    ({ from, to }) => overviewFilterSchema.safeParse({ from, to }).success,
    "Provide both dates in increasing order, at most 366 days apart."
  )
export type AuditQuery = z.infer<typeof auditQuerySchema>
export function parseAuditQuery(values: SearchValues) {
  return auditQuerySchema.safeParse({
    entityType: values.entityType,
    entityId: values.entityId,
    actorId: values.actorId,
    action: values.action,
    from: values.from,
    to: values.to,
    page: values.page,
    limit: values.limit,
  })
}
export function auditApiQuery(query: AuditQuery) {
  const { from, to, ...filters } = query
  return { ...filters, ...overviewApiQuery({ from, to }) }
}

export const auditEventSchema = z
  .object({
    id: z.uuid(),
    actorId: z.uuid().nullable(),
    action: actionSchema,
    entityType: entityTypeSchema,
    entityId: z.uuid(),
    createdAt: z.iso.datetime(),
    metadata: z.unknown(),
  })
  .transform((event) => ({
    ...event,
    metadata: safeAuditMetadata(event.action, event.metadata),
  }))
export type AuditEvent = z.infer<typeof auditEventSchema>
export const auditPageSchema = z.object({
  items: z.array(auditEventSchema).max(100),
  pagination: paginationSchema,
})
