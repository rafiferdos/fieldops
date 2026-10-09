import { expect, type Page } from "@playwright/test"

// Exercise the same menu and deliberate confirmation used by every role.
export async function confirmSignOut(page: Page) {
  await page
    .getByRole("button", { name: "Open account menu", exact: true })
    .click()
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Sign out of FieldOps?" })
  ).toBeVisible()
  const hold = page.getByRole("button", { name: "Hold to logout", exact: true })
  await hold.focus()
  await page.keyboard.down("Space")
  // Observe the resulting navigation while the real continuous key gesture completes.
  await expect(page).toHaveURL(/\/login$/)
  await page.keyboard.up("Space")
}
