"use server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireViewer } from "@/features/auth/session"
import { requestSchema } from "@/features/requests/schemas"
import { workOrderSchema } from "@/features/work-orders/schemas"
import { revalidateWork } from "@/features/work-orders/cache"
import { apiRequest } from "@/infrastructure/api/server"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import { reviewSchema, assignmentSchema, scheduleSchema } from "./schemas"

// Review uses the request's optimistic version; rejection always carries its reason.
export async function reviewRequest(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = reviewSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message: "Check the review decision, version and rejection reason.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    await apiRequest(`/requests/${identifier.data}/review`, requestSchema, {
      method: "PATCH",
      accessToken,
      body: parsed.data,
    })
    revalidatePath(`/admin/requests/${identifier.data}`)
    revalidatePath("/admin/requests")
    revalidatePath(`/customer/requests/${identifier.data}`)
    revalidatePath("/customer")
    return {
      ok: true,
      message:
        parsed.data.decision === "APPROVE"
          ? "Request approved."
          : "Request rejected.",
    }
  } catch (error) {
    return actionFailure(error)
  }
}

// Assignment deliberately has no version field; backend locks prevent duplicate booking.
export async function assignRequest(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = assignmentSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message: "Choose a qualified technician and a valid future visit window.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    const work = (
      await apiRequest(
        `/requests/${identifier.data}/assignment`,
        workOrderSchema,
        { method: "POST", accessToken, body: parsed.data }
      )
    ).data
    revalidateWork(work)
    return {
      ok: true,
      message: "Visit assigned.",
      destination: `/admin/work-orders/${work.id}`,
    }
  } catch (error) {
    return actionFailure(error)
  }
}

// Rescheduling carries the work version and leaves the agreed price untouched.
export async function rescheduleWork(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = scheduleSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message: "Check the technician, visit window and work version.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    const work = (
      await apiRequest(
        `/work-orders/${identifier.data}/schedule`,
        workOrderSchema,
        { method: "PATCH", accessToken, body: parsed.data }
      )
    ).data
    revalidateWork(work)
    return {
      ok: true,
      message: "Visit rescheduled.",
      destination: `/admin/work-orders/${work.id}`,
    }
  } catch (error) {
    return actionFailure(error)
  }
}
