import "server-only"
import { revalidatePath } from "next/cache"
import type { WorkOrder } from "./schemas"
import { workDetailPath, workListPath } from "./routes"

// One work change affects dispatch, technician execution and the customer's tracking.
export function revalidateWork(work: WorkOrder) {
  for (const role of ["CUSTOMER", "TECHNICIAN", "ADMIN"] as const) {
    revalidatePath(workListPath(role))
    revalidatePath(workDetailPath(role, work.id))
  }
  revalidatePath(`/customer/requests/${work.requestId}`)
  revalidatePath(`/admin/requests/${work.requestId}`)
  revalidatePath("/customer")
  revalidatePath("/admin/requests")
}
