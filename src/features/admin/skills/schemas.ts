import { z } from "zod"

const skillIds = z
  .array(z.uuid())
  .max(100)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Choose each service only once."
  )
export const skillOptionSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  active: z.boolean(),
})
export type SkillOption = z.infer<typeof skillOptionSchema>
export const technicianSkillsSchema = z
  .object({
    technicianId: z.uuid(),
    serviceIds: skillIds,
    services: z.array(skillOptionSchema).max(100),
  })
  .refine(
    ({ serviceIds, services }) =>
      services.length === serviceIds.length &&
      new Set(services.map((service) => service.id)).size === services.length &&
      services.every((service) => serviceIds.includes(service.id)),
    "The skill identities do not agree."
  )
export type TechnicianSkills = z.infer<typeof technicianSkillsSchema>
export const skillsFormSchema = z.strictObject({ serviceIds: skillIds })
// The original set is an atomic backend precondition, never an inferred empty default.
export const skillsUpdateSchema = skillsFormSchema.extend({
  expectedServiceIds: skillIds,
})
export const skillsUpdatedSchema = z.object({
  technicianId: z.uuid(),
  serviceIds: skillIds,
})
export function sameSkills(
  first: readonly string[],
  second: readonly string[]
) {
  return (
    first.length === second.length &&
    new Set(first).size === first.length &&
    first.every((id) => second.includes(id))
  )
}
