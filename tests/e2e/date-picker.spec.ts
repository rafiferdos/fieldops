import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { dhakaLocal } from "../../src/features/requests/schemas"
import { chooseDate } from "./helpers/date-picker"
import { respectAuthWindow } from "./helpers/auth-window"
import {
  clickWorkspaceControl,
  reachWorkspaceControl,
} from "./helpers/workspace-motion"

test.skip(
  process.env.E2E_DEMO_ACCOUNTS !== "1",
  "Requires configured real evaluation accounts"
)
test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})

test("shadcn report calendars retain dates, keyboard focus and mobile accessibility", async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.goto("/login")
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Admin demo", exact: true })
  )
  await expect(page).toHaveURL(/\/admin$/)
  await chooseDate(page, "From (Dhaka)", "2099-01-01")
  await chooseDate(page, "To (exclusive, Dhaka)", "2099-02-01")
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Apply period", exact: true })
  )
  await expect(page).toHaveURL(/from=2099-01-01&to=2099-02-01/)
  await expect(
    page.getByRole("heading", { name: "No requests in this period" })
  ).toBeVisible()
  await expect(page.getByLabel("From (Dhaka)", { exact: true })).toContainText(
    "1 Jan 2099"
  )
  await page.setViewportSize({ width: 320, height: 900 })
  const trigger = page.getByRole("button", {
    name: "From (Dhaka)",
    exact: true,
  })
  await reachWorkspaceControl(page, trigger)
  await trigger.focus()
  await page.keyboard.press("Enter")
  const popup = page.locator('[data-slot="popover-content"]')
  await expect(popup).toBeInViewport()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  const violations = await new AxeBuilder({ page })
    .include('[data-slot="popover-content"]')
    .analyze()
  expect(violations.violations).toEqual([])
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await page.goto("/admin/audit-logs")
  await chooseDate(page, "From (Dhaka)", "2099-01-01")
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Apply filters", exact: true })
  )
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "both valid dates"
  )
  await chooseDate(page, "To (exclusive, Dhaka)", "2099-02-01")
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Apply filters", exact: true })
  )
  await expect(
    page.getByRole("heading", { name: "No matching audit events" })
  ).toBeVisible()
})

test("calendar and minute selects preserve request details and reject an incomplete time", async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.goto("/login")
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Customer demo", exact: true })
  )
  await expect(page).toHaveURL(/\/customer$/)
  await page.goto("/customer/requests/new")
  await page.getByRole("combobox", { name: "Service", exact: true }).click()
  await page.getByRole("option").first().click()
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Continue", exact: true })
  )
  await page
    .getByLabel("What needs attention?")
    .fill("Calendar interaction verification without submitting a request")
  await page
    .getByLabel("Service address")
    .fill("Local verification address, Dhaka")
  const value = dhakaLocal(new Date(Date.now() + 2 * 86400000).toISOString())
  await chooseDate(page, "Preferred visit time", value)
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Continue", exact: true })
  )
  await expect(
    page.getByRole("heading", { name: "Review request" })
  ).toBeVisible()
  const back = page.getByRole("button", { name: "Back", exact: true })
  await reachWorkspaceControl(page, back)
  await back.click()
  await expect(
    page.getByRole("heading", { name: "Visit details" })
  ).toBeFocused()
  const trigger = page.getByRole("button", { name: "Preferred visit time" })
  await expect(trigger.locator("..")).toHaveAttribute("data-date-value", value)
  await reachWorkspaceControl(page, trigger)
  await trigger.click()
  await page
    .locator('[data-slot="popover-content"]')
    .getByRole("button", { name: "Clear", exact: true })
    .click()
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Continue", exact: true })
  )
  await expect(
    page.getByRole("alert").filter({ hasText: "Choose a future visit time" })
  ).toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(
    page.locator(
      'input[type="date"], input[type="datetime-local"], input[type="time"]'
    )
  ).toHaveCount(0)
})
