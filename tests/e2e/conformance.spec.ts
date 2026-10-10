import { expect, test } from "@playwright/test"
import { confirmDemoLogin } from "./helpers/demo-login"
import { confirmSignOut } from "./helpers/sign-out"
import {
  clickWorkspaceControl,
  reachWorkspaceControl,
} from "./helpers/workspace-motion"

test("demo confirmation can be dismissed without signing in", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_DEMO_ACCOUNTS !== "1",
    "Requires configured evaluation accounts"
  )
  await page.goto("/login")
  for (const role of ["Admin", "Customer", "Technician"]) {
    await page
      .getByRole("button", { name: `${role} demo`, exact: true })
      .click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toContainText("real FieldOps API")
    await expect(dialog).toContainText("Create your own customer account")
    await dialog.getByRole("button", { name: "Cancel demo sign in" }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  }
  expect(
    (await page.context().cookies()).some((cookie) =>
      cookie.name.includes("fieldops-session")
    )
  ).toBe(false)
})

test("public filters update URL and Back restores controls", async ({
  page,
}) => {
  await page.goto("/services?page=3&limit=10")
  await page.getByLabel("Search services").fill("missing-conformance-check")
  await page.getByRole("button", { name: "Apply filters", exact: true }).click()
  await expect(page).toHaveURL(/q=missing-conformance-check/)
  expect(new URL(page.url()).searchParams.get("page")).toBeNull()
  expect(new URL(page.url()).searchParams.get("limit")).toBe("10")
  await expect(
    page.getByRole("heading", { name: /No matching services/ })
  ).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel("Search services")).toHaveValue("")
})

test("real media audit events render and invalid filters stay local", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_DEMO_ACCOUNTS !== "1",
    "Requires configured evaluation accounts"
  )
  test.setTimeout(120000)
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/login")
  await confirmDemoLogin(page, "Admin")
  await expect(page).toHaveURL(/\/admin$/, { timeout: 45000 })
  await page.goto("/admin/audit-logs")
  await expect(
    page.getByRole("heading", { name: "Audit history", exact: true })
  ).toBeVisible()
  await expect(page.locator("[data-audit-id]").first()).toBeVisible()
  await page.goto("/admin/audit-logs?action=IMAGE_UPLOADED&limit=1")
  await expect(
    page.getByRole("heading", { name: "Audit history", exact: true })
  ).toBeVisible()
  const record = page.locator("[data-audit-id]")
  await expect(record).toHaveCount(1)
  await expect(record).toContainText("MEDIA")
  await clickWorkspaceControl(
    page,
    record.getByRole("button", { name: "View safe metadata" })
  )
  await expect(record).toContainText("purpose")
  const entityInput = page.getByLabel("Entity ID", { exact: true })
  await reachWorkspaceControl(page, entityInput)
  await entityInput.fill("not-a-uuid")
  const before = page.url()
  await clickWorkspaceControl(
    page,
    page.getByRole("button", { name: "Apply filters", exact: true })
  )
  await expect(page.locator("#filter-entityId-error")).toBeVisible()
  expect(page.url()).toBe(before)
  await expect(record).toHaveCount(1)
  await confirmSignOut(page)
  await page.goto("/admin/audit-logs")
  await expect(page).toHaveURL(/\/login\?returnTo=/)
  expect(errors).toEqual([])
})
