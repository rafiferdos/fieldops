import { z } from "zod"
import {
  overviewSchema,
  type overviewFilterSchema,
} from "@/features/admin/schemas"
import { requestSchema, requestStatusSchema } from "@/features/requests/schemas"
import { workOrderSchema } from "@/features/work-orders/schemas"
import { workStatusSchema } from "@/features/work-orders/status"

const count = z.number().int().nonnegative()
const workSummary = z.object({
  total: count,
  byStatus: z.record(workStatusSchema, count),
  recent: z.array(workOrderSchema).max(5),
})
const requestSummary = z.object({
  total: count,
  byStatus: z.record(requestStatusSchema, count),
  recent: z.array(requestSchema).max(5),
})
const common = {
  viewerId: z.uuid(),
  capturedAt: z.iso.datetime(),
  work: workSummary,
}
export const dashboardSchema = z.discriminatedUnion("role", [
  z.object({
    ...common,
    role: z.literal("CUSTOMER"),
    requests: requestSummary,
  }),
  z.object({ ...common, role: z.literal("TECHNICIAN") }),
  z.object({
    ...common,
    role: z.literal("ADMIN"),
    requests: requestSummary,
    overview: overviewSchema,
  }),
])
export type Dashboard = z.infer<typeof dashboardSchema>
export type DashboardFilters = z.infer<typeof overviewFilterSchema>
export const emptyDashboardFilters: DashboardFilters = { from: "", to: "" }
