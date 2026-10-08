"use server"
import { z } from "zod"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import {
  workOrderSchema,
  progressSchema,
  completionSchema,
  type WorkOrder,
} from "./schemas"
import { revalidateWork } from "./cache"

export type WorkActionResult =
  | { ok: true; message: string; work: WorkOrder }
  | Extract<ActionResult, { ok: false }>

// The backend verifies current assignment and legal state on every progress write.
export async function advanceWork(
  id: unknown,
  input: unknown
): Promise<WorkActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = progressSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message: "Check the work version and next progress state.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("TECHNICIAN")
  try {
    const work = (
      await apiRequest(
        `/work-orders/${identifier.data}/status`,
        workOrderSchema,
        { method: "PATCH", accessToken, body: parsed.data }
      )
    ).data
    revalidateWork(work)
    return { ok: true, message: "Work progress updated.", work }
  } catch (error) {
    return actionFailure(error)
  }
}

// Completion is one atomic backend operation; the browser cannot supply invoice data.
export async function completeWork(
  id: unknown,
  input: unknown
): Promise<WorkActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = completionSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message:
        "Provide the latest work version and a report of 10–2000 characters.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("TECHNICIAN")
  try {
    const work = (
      await apiRequest(
        `/work-orders/${identifier.data}/complete`,
        workOrderSchema,
        { method: "POST", accessToken, body: parsed.data }
      )
    ).data
    revalidateWork(work)
    return { ok: true, message: "Work completed and invoice issued.", work }
  } catch (error) {
    return actionFailure(error)
  }
}

// Recovery is an explicit read, never a retry of an uncertain completion or transition.
export async function inspectWork(id: unknown): Promise<WorkActionResult> {
  const identifier = z.uuid().safeParse(id)
  if (!identifier.success)
    return { ok: false, message: "This work order is unavailable." }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("TECHNICIAN")
  try {
    const work = (
      await apiRequest(`/work-orders/${identifier.data}`, workOrderSchema, {
        accessToken,
      })
    ).data
    return {
      ok: true,
      message:
        "Latest work state loaded. Review it before choosing another action.",
      work,
    }
  } catch (error) {
    return actionFailure(error)
  }
}
