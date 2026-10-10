import { format } from "date-fns"
import { expect, type Page } from "@playwright/test"
import { calendarDate } from "../../../src/shared/lib/calendar-value"
import { reachWorkspaceControl } from "./workspace-motion"

// Exercise calendar/select/focus behavior instead of injecting hidden input values.
export async function chooseDate(page: Page, label: string, value: string) {
  const [day = "", time] = value.split("T")
  const date = calendarDate(day)
  if (!date) throw Error("Expected a valid picker date")
  const trigger = page.getByRole("button", { name: label })
  await reachWorkspaceControl(page, trigger)
  await trigger.click()
  const popup = page.locator('[data-slot="popover-content"]')
  for (const [name, selection] of [
    ["Year", String(date.getFullYear())],
    ["Month", format(date, "LLLL")],
  ]) {
    if (!name || !selection) throw Error("Missing calendar choice")
    await popup.getByRole("combobox", { name, exact: true }).click()
    await page.getByRole("option", { name: selection, exact: true }).click()
  }
  await popup
    .getByRole("button", { name: new RegExp(format(date, "PPPP")) })
    .click()
  if (time !== undefined) {
    const [hour, minute] = time.split(":")
    for (const [name, selection] of [
      ["Hour", hour],
      ["Minute", minute],
    ]) {
      if (!name || !selection)
        throw Error("Expected a complete minute-precision time")
      await popup.getByRole("combobox", { name, exact: true }).click()
      await page.getByRole("option", { name: selection, exact: true }).click()
    }
    await popup.getByRole("button", { name: "Done", exact: true }).click()
  }
  await expect(popup).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(trigger.locator("..")).toHaveAttribute("data-date-value", value)
}
