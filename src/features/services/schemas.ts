import { z } from "zod"
import {
  firstValue,
  limitSchema,
  pageSchema,
  paginationSchema,
  searchSchema,
  type SearchValues,
} from "@/shared/lib/list-query"

export const serviceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  basePriceMinor: z.number().int().min(0).max(1000000000),
  currency: z.literal("BDT"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type Service = z.infer<typeof serviceSchema>
export const servicePageSchema = z.object({
  items: z.array(serviceSchema).max(100),
  pagination: paginationSchema,
})
export const serviceSortSchema = z.enum([
  "newest",
  "oldest",
  "name_asc",
  "price_asc",
  "price_desc",
])
export function parseServiceQuery(values: SearchValues) {
  return {
    q: searchSchema.parse(firstValue(values.q) ?? ""),
    page: pageSchema.parse(firstValue(values.page)),
    limit: limitSchema.parse(firstValue(values.limit)),
    sort: serviceSortSchema.catch("newest").parse(firstValue(values.sort)),
  }
}
