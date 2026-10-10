import { expect, type Page } from "@playwright/test"

// Dismissing the shared-account notice never authenticates; each test must confirm explicitly.
export async function confirmDemoLogin(
  page: Page,
  role: "Admin" | "Customer" | "Technician"
) {
  await page.getByRole("button", { name: `${role} demo`, exact: true }).click()
  const dialog = page.getByRole("dialog", {
    name: `Before you explore the ${role.toLowerCase()} demo`,
  })
  await expect(dialog).toBeVisible()
  await dialog
    .getByRole("button", {
      name: `Continue to ${role.toLowerCase()} demo`,
      exact: true,
    })
    .click()
}
