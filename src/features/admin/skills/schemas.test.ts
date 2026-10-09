import { describe, expect, it } from "vitest"
import {
  sameSkills,
  skillsUpdateSchema,
  technicianSkillsSchema,
} from "./schemas"

const technicianId = "00000000-0000-4000-8000-000000000001"
const serviceId = "00000000-0000-4000-8000-000000000002"

describe("technician skill replacement boundaries", () => {
  it("requires an explicit complete snapshot and rejects duplicate or untrusted fields", () => {
    expect(skillsUpdateSchema.safeParse({ serviceIds: [] }).success).toBe(false)
    expect(
      skillsUpdateSchema.safeParse({
        serviceIds: [serviceId, serviceId],
        expectedServiceIds: [],
      }).success
    ).toBe(false)
    expect(
      skillsUpdateSchema.safeParse({
        serviceIds: [],
        expectedServiceIds: [],
        role: "ADMIN",
      }).success
    ).toBe(false)
    expect(
      skillsUpdateSchema.safeParse({
        serviceIds: [],
        expectedServiceIds: [serviceId],
      }).success
    ).toBe(true)
  })
  it("retains unavailable identities and rejects incomplete or mismatched reads", () => {
    const valid = {
      technicianId,
      serviceIds: [serviceId],
      services: [{ id: serviceId, name: "Retired service", active: false }],
    }
    expect(technicianSkillsSchema.safeParse(valid).success).toBe(true)
    expect(
      technicianSkillsSchema.safeParse({ ...valid, services: [] }).success
    ).toBe(false)
    expect(
      technicianSkillsSchema.safeParse({ ...valid, serviceIds: [technicianId] })
        .success
    ).toBe(false)
  })
  it("compares complete sets without treating order as an edit or duplicates as a match", () => {
    expect(
      sameSkills([technicianId, serviceId], [serviceId, technicianId])
    ).toBe(true)
    expect(sameSkills([], [serviceId])).toBe(false)
    expect(sameSkills([serviceId, serviceId], [serviceId, technicianId])).toBe(
      false
    )
  })
})
