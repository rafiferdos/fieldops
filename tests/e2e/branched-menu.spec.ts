import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { respectAuthWindow } from "./helpers/auth-window"

test.skip(
  process.env.E2E_DEMO_ACCOUNTS !== "1",
  "Requires configured real evaluation accounts"
)
test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})

test("original branch drawing and section marker survive real route changes", async ({
  page,
}) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/login")
  await page.getByRole("button", { name: "Admin demo", exact: true }).click()
  await expect(page).toHaveURL(/\/admin$/)
  const nav = page.getByRole("navigation", {
    name: "Workspace navigation",
    exact: true,
  })
  await nav.evaluate((node) => {
    node.addEventListener("transitionrun", (event) => {
      if (
        event instanceof TransitionEvent &&
        event.propertyName === "stroke-dashoffset"
      )
        node.setAttribute("data-draw-proof", "seen")
      if (event instanceof TransitionEvent && event.propertyName === "top")
        node.setAttribute("data-marker-proof", "seen")
    })
  })
  const operations = nav.getByRole("button", {
    name: "Operations",
    exact: true,
  })
  await operations.evaluate((node) =>
    node.setAttribute("data-identity-proof", "retained")
  )
  await nav.getByRole("link", { name: "Requests", exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/requests$/)
  await expect(operations).toHaveAttribute("data-identity-proof", "retained")
  await expect(nav).toHaveAttribute("data-draw-proof", "seen")
  const marker = nav.locator("[data-branch-marker]")
  await expect(marker).toHaveAttribute("data-on", "")
  await nav.getByRole("link", { name: "Work orders", exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/work-orders$/)
  await expect(
    nav.getByRole("link", { name: "Work orders", exact: true })
  ).toHaveAttribute("aria-current", "page")
  await operations.click()
  await expect(operations).toHaveAttribute("aria-expanded", "false")
  await expect(
    nav.getByRole("link", { name: "Requests", exact: true })
  ).not.toBeVisible()
  await nav
    .getByRole("link", { name: "Profile & settings", exact: true })
    .click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(operations).toHaveAttribute("aria-expanded", "false")
  await expect(nav).toHaveAttribute("data-marker-proof", "seen")
  await expect(marker).toHaveAttribute("data-on", "")
  await operations.click()
  await expect(
    nav.getByRole("link", { name: "Requests", exact: true })
  ).toBeVisible()
  await page.emulateMedia({ reducedMotion: "reduce" })
  expect(
    await marker.evaluate((node) =>
      parseFloat(getComputedStyle(node).transitionDuration)
    )
  ).toBeLessThan(0.001)
  const accessibility = await new AxeBuilder({ page })
    .include("[data-branched-menu]")
    .analyze()
  expect(accessibility.violations).toEqual([])
})
