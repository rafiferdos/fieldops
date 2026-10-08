import { z } from "zod"
import { roleSchema, userSchema } from "@/features/auth/schemas"
import { paginationSchema, type SearchValues } from "@/shared/lib/list-query"
import { adminPaginationShape } from "../query"

export const userStatusSchema = z.enum(["ACTIVE", "SUSPENDED"])
export const managedUserSchema = userSchema.extend({
  status: userStatusSchema,
  updatedAt: z.iso.datetime(),
})
export type ManagedUser = z.infer<typeof managedUserSchema>
export const managedUserPageSchema = z.object({
  items: z.array(managedUserSchema).max(100),
  pagination: paginationSchema,
})
export const managedUsersQuerySchema = z.strictObject({
  ...adminPaginationShape,
  q: z.string().trim().max(100).default(""),
  role: roleSchema
    .or(z.literal(""))
    .optional()
    .transform((value) => value || undefined),
  status: userStatusSchema
    .or(z.literal(""))
    .optional()
    .transform((value) => value || undefined),
  sort: z.enum(["newest", "oldest"]).default("newest"),
})
export type ManagedUsersQuery = z.infer<typeof managedUsersQuerySchema>
export function parseManagedUsersQuery(values: SearchValues) {
  return managedUsersQuerySchema.safeParse({
    q: values.q,
    role: values.role,
    status: values.status,
    sort: values.sort,
    page: values.page,
    limit: values.limit,
  })
}

// The snapshot is a stale-form check, not atomic backend versioning or authorization.
export const accessSnapshotSchema = managedUserSchema.pick({
  role: true,
  status: true,
  updatedAt: true,
})
export const accessFormSchema = z.strictObject({
  role: roleSchema,
  status: userStatusSchema,
})
export const accessUpdateSchema = accessFormSchema
  .partial()
  .refine(
    (value) => value.role !== undefined || value.status !== undefined,
    "Choose at least one access change."
  )
export function changedAccess(
  current: z.infer<typeof accessSnapshotSchema>,
  requested: z.infer<typeof accessUpdateSchema>
) {
  return accessUpdateSchema.safeParse({
    ...(requested.role !== undefined && requested.role !== current.role
      ? { role: requested.role }
      : {}),
    ...(requested.status !== undefined && requested.status !== current.status
      ? { status: requested.status }
      : {}),
  })
}
