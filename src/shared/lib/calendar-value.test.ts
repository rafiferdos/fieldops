import { describe, expect, it } from "vitest"
import { calendarDate, calendarDay, calendarLabel } from "./calendar-value"

describe("Dhaka calendar values", () => {
  it("keeps the civil day across a UTC midnight boundary", () => {
    const day = calendarDate("2028-02-29")
    expect(day?.getTime()).toBe(Date.parse("2028-02-28T18:00:00.000Z"))
    if (!day) throw Error("Expected a valid leap day")
    expect(calendarDay(day)).toBe("2028-02-29")
    expect(calendarDay(new Date("2026-10-10T18:01:00Z"))).toBe("2026-10-11")
  })

  it.each(["2026-02-29", "2026-04-31", "2026-13-01", "2099-01-01<script>", ""])(
    "rejects impossible or malformed civil days: %s",
    (value) => {
      expect(calendarDate(value)).toBeUndefined()
    }
  )

  it("shows incomplete time as an instruction rather than silently choosing a visit time", () => {
    expect(calendarLabel("2026-10-11T09:", true)).toBe(
      "11 Oct 2026 · Choose time"
    )
    expect(calendarLabel("2026-10-11T09:07", true)).toBe("11 Oct 2026 · 09:07")
    expect(calendarLabel("2026-10-11T24:00", true)).toBe(
      "11 Oct 2026 · Choose time"
    )
    expect(calendarLabel("2099-02-01", false)).toBe("1 Feb 2099")
  })
})
