"use server"
import { revalidatePath } from "next/cache"
import { apiRequest } from "@/infrastructure/api/server"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import { requireViewer } from "@/features/auth/session"
import { profileSchema } from "@/features/auth/schemas"
import { updateProfileSchema } from "./schemas"

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      message: "Check your name and international phone number.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer()
  try {
    await apiRequest("/users/me", profileSchema, {
      method: "PATCH",
      accessToken,
      body: { ...parsed.data, phone: parsed.data.phone || null },
    })
    revalidatePath("/account")
    return { ok: true, message: "Profile updated." }
  } catch (error) {
    return actionFailure(error)
  }
}
