"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireViewer } from "@/features/auth/session"
import { servicePageSchema } from "@/features/services/schemas"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import {
  technicianSkillsSchema,
  skillsUpdateSchema,
  skillsUpdatedSchema,
  sameSkills,
  type TechnicianSkills,
} from "./schemas"

type SkillOptions = z.infer<typeof servicePageSchema>
type ReadResult<T> = { ok: true; data: T } | { ok: false; message: string }

export async function inspectSkills(id: unknown): Promise<
  ReadResult<{
    skills: TechnicianSkills
    catalog: SkillOptions
  }>
> {
  const parsed = z.uuid().safeParse(id)
  if (!parsed.success)
    return { ok: false, message: "Choose a valid technician." }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  try {
    // Read the complete saved set independently of catalog pagination or deletion.
    const [skills, catalog] = await Promise.all([
      apiRequest(`/technicians/${parsed.data}/skills`, technicianSkillsSchema, {
        accessToken,
      }),
      apiRequest("/services?sort=name_asc&limit=100&page=1", servicePageSchema),
    ])
    if (skills.data.technicianId !== parsed.data)
      throw new Error("Skill identity mismatch")
    return { ok: true, data: { skills: skills.data, catalog: catalog.data } }
  } catch (error) {
    return { ok: false, message: actionFailure(error).message }
  }
}

export async function loadSkillOptions(
  page: unknown
): Promise<ReadResult<SkillOptions>> {
  const parsed = z.number().int().min(2).max(100000).safeParse(page)
  if (!parsed.success)
    return { ok: false, message: "Choose a valid catalog page." }
  await requireSameOrigin()
  await requireViewer("ADMIN")
  try {
    return {
      ok: true,
      data: (
        await apiRequest(
          `/services?sort=name_asc&limit=100&page=${parsed.data}`,
          servicePageSchema
        )
      ).data,
    }
  } catch (error) {
    return { ok: false, message: actionFailure(error).message }
  }
}

export async function replaceTechnicianSkills(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = skillsUpdateSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return {
      ok: false,
      message:
        "Choose up to 100 unique services and inspect the current skills.",
    }
  await requireSameOrigin()
  const { accessToken } = await requireViewer("ADMIN")
  if (sameSkills(parsed.data.serviceIds, parsed.data.expectedServiceIds))
    return { ok: false, message: "Choose a different skill set before saving." }
  let dispatched = false
  try {
    dispatched = true
    const result = (
      await apiRequest(
        `/technicians/${identifier.data}/skills`,
        skillsUpdatedSchema,
        {
          method: "PUT",
          accessToken,
          body: parsed.data,
        }
      )
    ).data
    if (
      result.technicianId !== identifier.data ||
      !sameSkills(result.serviceIds, parsed.data.serviceIds)
    )
      throw new Error("Skill replacement response mismatch")
    revalidatePath("/admin/users")
    revalidatePath("/admin/audit-logs")
    revalidatePath("/admin/requests", "layout")
    return { ok: true, message: "Technician skills updated." }
  } catch (error) {
    const failure = actionFailure(error)
    const rejected =
      error instanceof ApiError &&
      error.kind === "http" &&
      error.status !== null &&
      error.status < 500
    // A lost response may hide a completed replacement; require inspection before another write.
    return {
      ...failure,
      uncertain: failure.uncertain || (dispatched && !rejected),
    }
  }
}
