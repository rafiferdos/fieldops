import { z } from "zod"

export const workStatusSchema = z.enum([
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
])
export type WorkStatus = z.infer<typeof workStatusSchema>

// Completion is a separate atomic report/invoice operation, never a status PATCH.
export function nextWorkStatus(status: WorkStatus) {
  if (status === "ASSIGNED") return "EN_ROUTE"
  if (status === "EN_ROUTE") return "IN_PROGRESS"
  return null
}
