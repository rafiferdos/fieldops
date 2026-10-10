import { z } from "zod"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { requestStatusSchema } from "@/features/requests/schemas"

const count = z.number().int().nonnegative()
const day = z.union([z.literal(""), z.iso.date()])
export const overviewFilterSchema = z
  .strictObject({ from: day, to: day })
  .refine(
    (value) => {
      if (!value.from && !value.to) return true
      const from = Date.parse(value.from),
        to = Date.parse(value.to)
      return (
        !!value.from && !!value.to && to > from && to - from <= 366 * 86400000
      )
    },
    {
      message:
        "Provide both dates, with an increasing range of at most 366 days.",
      path: ["to"],
    }
  )

export function parseOverviewFilters(values: SearchValues) {
  return overviewFilterSchema.safeParse({
    from: firstValue(values.from) ?? "",
    to: firstValue(values.to) ?? "",
  })
}
export function overviewApiQuery(
  filters: z.infer<typeof overviewFilterSchema>
) {
  // Date controls represent Dhaka midnight; the API's upper bound remains exclusive.
  return filters.from && filters.to
    ? {
        from: `${filters.from}T00:00:00+06:00`,
        to: `${filters.to}T00:00:00+06:00`,
      }
    : {}
}
export const overviewSchema = z.object({
  period: z.object({ from: z.iso.datetime(), to: z.iso.datetime() }),
  requests: z
    .object({
      total: count,
      byStatus: z.partialRecord(requestStatusSchema, count),
    })
    .refine(
      (value) =>
        Object.values(value.byStatus).reduce((sum, n) => sum + n, 0) ===
        value.total
    ),
  workOrders: z
    .object({
      total: count,
      completed: count,
      completionRate: z.number().min(0).max(100),
    })
    .refine((value) => value.completed <= value.total),
  invoices: z.object({
    paidCount: count,
    verifiedRevenueMinor: z
      .string()
      .regex(/^(0|[1-9]\d*)$/)
      .max(40),
    currency: z.literal("BDT"),
  }),
  technicians: z
    .object({ total: count, active: count })
    .refine((value) => value.active <= value.total),
})
export type Overview = z.infer<typeof overviewSchema>

// Format an exact aggregate without converting it through floating-point Number.
export function formatRevenue(minor: string) {
  const amount = BigInt(minor)
  return `BDT ${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount / 100n)}.${(amount % 100n).toString().padStart(2, "0")}`
}
