import { describe, expect, it } from "vitest"
import { createQueryClient } from "@/infrastructure/query/client"
import { dashboardKey } from "./query"
import { createWorkspacePreferences } from "./preferences"

describe("workspace state ownership", () => {
  it("isolates server caches and distinguishes account, role and period", () => {
    const first = createQueryClient(),
      second = createQueryClient()
    const filters = { from: "", to: "" }
    first.setQueryData(dashboardKey("first", "CUSTOMER", filters), {
      total: 27,
    })
    expect(
      second.getQueryData(dashboardKey("first", "CUSTOMER", filters))
    ).toBeUndefined()
    expect(
      first.getQueryData(dashboardKey("second", "CUSTOMER", filters))
    ).toBeUndefined()
    expect(
      first.getQueryData(dashboardKey("first", "ADMIN", filters))
    ).toBeUndefined()
    expect(
      first.getQueryData(
        dashboardKey("first", "CUSTOMER", {
          from: "2026-01-01",
          to: "2026-02-01",
        })
      )
    ).toBeUndefined()
    first.clear()
    second.clear()
  })
  it("owns UI preferences per provider without credentials or records", () => {
    const first = createWorkspacePreferences(),
      second = createWorkspacePreferences()
    first.getState().setSidebarOpen(false)
    expect(second.getState().sidebarOpen).toBe(true)
    expect(Object.keys(first.getState()).sort()).toEqual([
      "setSidebarOpen",
      "sidebarOpen",
    ])
  })
})
