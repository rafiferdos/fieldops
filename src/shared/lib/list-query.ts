import { z } from "zod"

export type SearchValues = Record<string, string | string[] | undefined>

export function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

export const pageSchema = z.coerce.number().int().min(1).max(100000).catch(1)
export const limitSchema = z.coerce.number().int().min(1).max(100).catch(20)
export const searchSchema = z.string().trim().max(100).catch("")
export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export function queryString(
  values: Record<string, string | number | undefined>
) {
  const query = new URLSearchParams()
  for (const [name, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") query.set(name, String(value))
  }
  return query.toString()
}
