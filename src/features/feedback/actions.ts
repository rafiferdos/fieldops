"use server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import { workDetailSchema } from "@/features/work-orders/schemas"
import {
  feedbackSchema,
  feedbackInputSchema,
  feedbackEligible,
} from "./schemas"
import { knownPaymentReview } from "./server"

export async function submitFeedback(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = feedbackInputSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message:
        "Choose a rating from 1 to 5 and keep the optional comment within 1000 characters.",
    }
  await requireSameOrigin()
  const { profile, accessToken } = await requireViewer("CUSTOMER")
  try {
    const work = (
      await apiRequest(`/work-orders/${identifier.data}`, workDetailSchema, {
        accessToken,
      })
    ).data
    const held = work.invoice
      ? await knownPaymentReview(profile.id, work.invoice.id, accessToken)
      : false
    if (!feedbackEligible(work, held))
      return {
        ok: false,
        conflict: true,
        message:
          "Feedback requires completed, paid work without existing feedback or a known payment review hold.",
      }
    await apiRequest(`/work-orders/${work.id}/feedback`, feedbackSchema, {
      method: "POST",
      accessToken,
      body: parsed.data,
    })
    revalidatePath(`/customer/work-orders/${work.id}`)
    revalidatePath(`/admin/work-orders/${work.id}`)
    revalidatePath(`/technician/work-orders/${work.id}`)
    return { ok: true, message: "Thank you. Your feedback has been submitted." }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function inspectFeedback(
  id: unknown
): Promise<ActionResult & { eligible?: boolean; submitted?: boolean }> {
  const identifier = z.uuid().safeParse(id)
  if (!identifier.success)
    return { ok: false, message: "This work order is unavailable." }
  await requireSameOrigin()
  const { profile, accessToken } = await requireViewer("CUSTOMER")
  try {
    const work = (
      await apiRequest(`/work-orders/${identifier.data}`, workDetailSchema, {
        accessToken,
      })
    ).data
    const held = work.invoice
      ? await knownPaymentReview(profile.id, work.invoice.id, accessToken)
      : false
    return {
      ok: true,
      message: work.feedback
        ? "Your feedback is already recorded."
        : "Latest eligibility inspected. Review before submitting.",
      eligible: feedbackEligible(work, held),
      submitted: !!work.feedback,
    }
  } catch (error) {
    return actionFailure(error)
  }
}
