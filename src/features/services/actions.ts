"use server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireViewer } from "@/features/auth/session"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { apiRequest } from "@/infrastructure/api/server"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import { serviceSchema } from "./schemas"
import { serviceInputSchema, serviceUpdateSchema } from "./management-schemas"

function refreshCatalog(id?: string) {
  for (const path of [
    "/",
    "/services",
    "/admin/services",
    "/customer/requests/new",
  ])
    revalidatePath(path)
  if (id) revalidatePath(`/services/${id}`)
}
export async function createService(input: unknown): Promise<ActionResult> {
  const parsed = serviceInputSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      message: "Check the service name, description and BDT price.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    const service = (
      await apiRequest("/services", serviceSchema, {
        method: "POST",
        accessToken,
        body: parsed.data,
      })
    ).data
    refreshCatalog(service.id)
    return { ok: true, message: "Service added to the active catalog." }
  } catch (error) {
    return actionFailure(error)
  }
}

// Catalog updates have no backend version field; preflight detects already-stale forms.
export async function updateService(
  id: unknown,
  updatedAt: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    stamp = z.iso.datetime().safeParse(updatedAt),
    parsed = serviceUpdateSchema.safeParse(input)
  if (!identifier.success || !stamp.success || !parsed.success)
    return {
      ok: false,
      message:
        "Check the latest service and provide at least one changed field.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    const current = (
      await apiRequest(`/services/${identifier.data}`, serviceSchema, {
        accessToken,
      })
    ).data
    if (current.updatedAt !== stamp.data)
      return {
        ok: false,
        conflict: true,
        message:
          "This catalog entry changed. Reload its latest details before editing.",
      }
    await apiRequest(`/services/${identifier.data}`, serviceSchema, {
      method: "PATCH",
      accessToken,
      body: parsed.data,
    })
    refreshCatalog(identifier.data)
    return {
      ok: true,
      message:
        "Service updated. Existing agreed prices and invoices stay frozen.",
    }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function removeService(id: unknown): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id)
  if (!identifier.success)
    return { ok: false, message: "This service is unavailable." }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    await apiRequest(`/services/${identifier.data}`, z.null(), {
      method: "DELETE",
      accessToken,
    })
    refreshCatalog(identifier.data)
    return {
      ok: true,
      message:
        "Service removed from the public catalog. Its history is preserved.",
    }
  } catch (error) {
    return actionFailure(error)
  }
}
