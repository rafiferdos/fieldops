"use server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { apiRequest } from "@/infrastructure/api/server"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { requireViewer } from "@/features/auth/session"
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
  const { accessToken } = await requireViewer("CUSTOMER")
  try {
    await apiRequest(`/requests/${identifier.data}/cancel`, requestSchema, {
      method: "POST",
      accessToken,
      body: parsed.data,
    })
    revalidatePath(`/customer/requests/${identifier.data}`)
    revalidatePath("/customer")
    return { ok: true, message: "Request cancelled." }
  } catch (error) {
    return actionFailure(error)
  }
}
