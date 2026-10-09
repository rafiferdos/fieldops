"use server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { apiRequest } from "@/infrastructure/api/server"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { requireViewer } from "@/features/auth/session"
import { workDetailPath } from "@/features/work-orders/routes"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import {
  createRequestSchema,
  updateRequestSchema,
  cancelRequestSchema,
  requestSchema,
} from "./schemas"

export async function createRequest(input: unknown): Promise<ActionResult> {
  const parsed = createRequestSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      message: "Check the service, address, description and future visit time.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("CUSTOMER")
  try {
    const result = await apiRequest("/requests", requestSchema, {
      method: "POST",
      accessToken,
      body: parsed.data,
    })
    revalidatePath("/customer")
    revalidatePath("/customer/requests")
    return {
      ok: true,
      message: "Service request submitted.",
      destination: `/customer/requests/${result.data.id}`,
    }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function editRequest(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = updateRequestSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return { ok: false, message: "Check the request fields and version." }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("CUSTOMER")
  try {
    await apiRequest(`/requests/${identifier.data}`, requestSchema, {
      method: "PATCH",
      accessToken,
      body: parsed.data,
    })
    revalidatePath(`/customer/requests/${identifier.data}`)
    revalidatePath("/customer")
    revalidatePath("/customer/requests")
    return { ok: true, message: "Request updated." }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function cancelRequest(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = cancelRequestSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message: "Provide a cancellation reason of 3–500 characters.",
    }
  await requireSameOrigin()
  // Both supported callers cancel with the request version, never a work version.
  const { accessToken, profile } = await requireViewer()
  if (profile.role === "TECHNICIAN")
    return { ok: false, message: "Technicians cannot cancel requests." }
  try {
    const cancelled = (
      await apiRequest(`/requests/${identifier.data}/cancel`, requestSchema, {
        method: "POST",
        accessToken,
        body: parsed.data,
      })
    ).data
    // Cancellation changes both records atomically; invalidate their separate detail routes.
    if (cancelled.workOrder)
      for (const role of ["CUSTOMER", "TECHNICIAN", "ADMIN"] as const)
        revalidatePath(workDetailPath(role, cancelled.workOrder.id))
    revalidatePath(`/customer/requests/${identifier.data}`)
    revalidatePath("/customer")
    revalidatePath("/customer/requests")
    revalidatePath(`/admin/requests/${identifier.data}`)
    revalidatePath("/admin/requests")
    revalidatePath("/admin/work-orders")
    revalidatePath("/customer/work-orders")
    revalidatePath("/technician")
    revalidatePath("/technician/work-orders")
    return { ok: true, message: "Request cancelled." }
  } catch (error) {
    return actionFailure(error)
  }
}
