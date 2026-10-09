import { expect, type Page } from "@playwright/test"

// Exercise the same menu and deliberate confirmation used by every role.
export async function confirmSignOut(page: Page) {
  await page
    .getByRole("button", { name: "Open account menu", exact: true })
    .click()
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click()
  await expect(
    page.getByRole("alertdialog", { name: "Sign out of FieldOps?" })
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Confirm sign out", exact: true })
    .click()
  await expect(page).toHaveURL(/\/login$/)
}
