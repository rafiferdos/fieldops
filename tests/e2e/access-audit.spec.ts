import { randomUUID } from "node:crypto"
import { expect, test, type Page } from "@playwright/test"
import { respectAuthWindow } from "./helpers/auth-window"
import { chooseOption } from "./helpers/choice-select"
import { createManagedUserFixture } from "./helpers/managed-user-fixture"

test.skip(
  process.env.E2E_LIVE_WRITES !== "1" || process.env.E2E_DEMO_ACCOUNTS !== "1",
  "Requires authorized disposable access records and demo accounts"
)
test.beforeEach(async () => {
  test.setTimeout(150000)
  await respectAuthWindow()
})

async function demoLogin(
  page: Page,
  role: "Admin" | "Customer" | "Technician"
) {
  await page.goto("/login")
  await page.getByRole("button", { name: `${role} demo`, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`), {
    timeout: 45000,
  })
}
async function reviewAndConfirm(page: Page) {
  await page
    .getByRole("button", { name: "Review access change", exact: true })
    .click()
  await expect(page.getByRole("alertdialog")).toBeVisible()
  await page
    .getByRole("button", { name: "Confirm access change", exact: true })
    .click()
}

test("disposable access changes revoke sessions and recover without replay; audit records remain inspectable", async ({
  page,
}) => {
  const fixture = await createManagedUserFixture(),
    stale = await page.context().newPage()
  const card = page.locator(`[data-user-id="${fixture.id}"]`)
  try {
    await demoLogin(page, "Admin")
    const directory = `/admin/users?q=${encodeURIComponent(fixture.email)}`
    await page.goto(directory)
    await expect(card).toContainText("ACTIVE")
    await stale.goto(directory)
    await stale
      .getByRole("button", { name: "Manage access", exact: true })
      .click()
    await card
      .getByRole("button", { name: "Manage access", exact: true })
      .click()
    await chooseOption(page, "Account status", "Suspended")
    let calls = 0
    await page.route("**/admin/users**", async (route) => {
      if (
        route.request().method() === "POST" &&
        route.request().headers()["next-action"]
      ) {
        calls++
        await route.fetch()
        await route.abort("failed")
      } else await route.continue()
    })
    await reviewAndConfirm(page)
    await expect(
      page.getByRole("alert").filter({ hasText: "outcome is uncertain" })
    ).toBeVisible()
    expect(calls).toBe(1)
    await page.unroute("**/admin/users**")
    await expect(
      page.getByRole("button", { name: "Review access change", exact: true })
    ).toBeDisabled()
    expect(await fixture.originalProfileStatus()).toBe(401)
    expect(await fixture.originalRefreshStatus()).toBe(401)
    expect(await fixture.passwordLoginStatus()).toBe(401)
    await chooseOption(stale, "Primary role", "Technician")
    await reviewAndConfirm(stale)
    await expect(
      stale
        .getByRole("alert")
        .filter({ hasText: "account or directory page changed" })
    ).toBeVisible()
    await stale.keyboard.press("Escape")
    await stale
      .getByRole("button", { name: "Manage access", exact: true })
      .click()
    await expect(
      stale.getByRole("button", { name: "Review access change", exact: true })
    ).toBeDisabled()
    expect((await fixture.getUser()).role).toBe("CUSTOMER")
    await page
      .getByRole("button", { name: "Inspect latest directory", exact: true })
      .click()
    await expect(card).toContainText("SUSPENDED")
    await card
      .getByRole("button", { name: "Manage access", exact: true })
      .click()
    await chooseOption(page, "Account status", "Active")
    await reviewAndConfirm(page)
    await expect(
      page.getByRole("dialog", { name: "Manage account access", exact: true })
    ).not.toBeVisible()
    await expect(card).toContainText("ACTIVE")
    expect(await fixture.originalProfileStatus()).toBe(401)
    expect((await fixture.freshLogin()).role).toBe("CUSTOMER")
    expect(await fixture.latestProfileStatus()).toBe(200)
    await card
      .getByRole("button", { name: "Manage access", exact: true })
      .click()
    await chooseOption(page, "Primary role", "Technician")
    await reviewAndConfirm(page)
    await expect(
      page.getByRole("dialog", { name: "Manage account access", exact: true })
    ).not.toBeVisible()
    await expect(card).toContainText("TECHNICIAN")
    expect(await fixture.latestProfileStatus()).toBe(401)
    expect((await fixture.freshLogin()).role).toBe("TECHNICIAN")
    await card
      .getByRole("link", { name: "View access history", exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`entityId=${fixture.id}`))
    const events = page.locator(`[data-entity-id="${fixture.id}"]`)
    await expect(events).toHaveCount(3)
    await expect(
      events
        .first()
        .getByRole("heading", { name: "USER_ACCESS_UPDATED", exact: true })
    ).toBeVisible()
    await events
      .first()
      .getByRole("button", { name: "View safe metadata", exact: true })
      .click()
    await expect(events.first()).toContainText("previousRole")
    await expect(events.first()).toContainText("TECHNICIAN")
    await expect(events.first()).not.toContainText("passwordHash")
    await expect(events.first()).not.toContainText("refreshToken")
    await page.goto(
      `/admin/audit-logs?entityType=USER&entityId=${fixture.id}&action=USER_ACCESS_UPDATED&limit=1`
    )
    await page.getByRole("link", { name: "Go to next page" }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.locator(`[data-entity-id="${fixture.id}"]`)).toHaveCount(
      1
    )
  } finally {
    await stale.close()
    await fixture.cleanup()
  }
})

test("self access change clears the frontend session and requires fresh role login", async ({
  page,
}) => {
  const fixture = await createManagedUserFixture()
  try {
    await fixture.setAccess({ role: "ADMIN" })
    await page.goto("/login")
    await page.getByLabel("Email address").fill(fixture.email)
    await page.getByLabel("Password", { exact: true }).fill(fixture.password)
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/admin$/, { timeout: 45000 })
    await page.goto(`/admin/users?q=${encodeURIComponent(fixture.email)}`)
    await page
      .getByRole("button", { name: "Manage access", exact: true })
      .click()
    await expect(
      page.getByText("This is your account. Changing access signs you out.", {
        exact: true,
      })
    ).toBeVisible()
    await chooseOption(page, "Primary role", "Customer")
    await reviewAndConfirm(page)
    await expect(page).toHaveURL(/\/login$/, { timeout: 45000 })
    expect(
      (await page.context().cookies()).some(
        (cookie) => cookie.name === "fieldops-session"
      )
    ).toBe(false)
    await page.goto("/admin/users")
    await expect(page).toHaveURL(/\/login\?returnTo=/)
    await page.getByLabel("Email address").fill(fixture.email)
    await page.getByLabel("Password", { exact: true }).fill(fixture.password)
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/customer$/, { timeout: 45000 })
    await page.getByRole("button", { name: "Sign out", exact: true }).click()
  } finally {
    await fixture.cleanup()
  }
})

test("administrative filters, history pagination, responsive navigation and wrong-role boundaries use real reads", async ({
  page,
}) => {
  await demoLogin(page, "Admin")
  await page.goto("/admin/users?role=CUSTOMER&limit=1")
  await expect(page.locator("[data-user-id]")).toHaveCount(1)
  await page.getByRole("link", { name: "Go to next page" }).click()
  await expect(page).toHaveURL(/page=2/)
  expect(new URL(page.url()).searchParams.get("role")).toBe("CUSTOMER")
  await page
    .getByLabel("Search users", { exact: true })
    .fill(`missing-${randomUUID()}`)
  await page.getByRole("button", { name: "Apply filters", exact: true }).click()
  await expect(page).not.toHaveURL(/page=2/)
  await expect(
    page.getByRole("heading", { name: "No matching users" })
  ).toBeVisible()
  await page.goto("/admin/users?status=DELETED")
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "valid role/status"
  )
  await expect(page.locator("[data-user-id]")).toHaveCount(0)
  await page.goto("/admin/audit-logs?limit=1")
  await expect(page.locator("[data-audit-id]")).toHaveCount(1)
  await page.getByLabel("From (Dhaka)", { exact: true }).fill("2099-01-01")
  await page.getByRole("button", { name: "Apply filters", exact: true }).click()
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "both valid dates"
  )
  await expect(page.locator("[data-audit-id]")).toHaveCount(0)
  await expect(page.getByLabel("From (Dhaka)", { exact: true })).toHaveValue(
    "2099-01-01"
  )
  await page
    .getByLabel("To (exclusive, Dhaka)", { exact: true })
    .fill("2099-02-01")
  await page.getByRole("button", { name: "Apply filters", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "No matching audit events" })
  ).toBeVisible()
  await page.goto("/admin/audit-logs?entityType=SECRET")
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Check entity/action filters"
  )
  await expect(page.locator("[data-audit-id]")).toHaveCount(0)
  for (const route of ["/admin/users?limit=1", "/admin/audit-logs?limit=1"]) {
    await page.goto(route)
    for (const width of [320, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
    await page
      .getByRole("button", { name: "Toggle light and dark theme" })
      .click()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click()
  for (const role of ["Customer", "Technician"] as const) {
    await demoLogin(page, role)
    for (const route of ["/admin/users", "/admin/audit-logs"]) {
      await page.goto(route)
      await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`))
      await expect(page.locator("[data-user-id], [data-audit-id]")).toHaveCount(
        0
      )
    }
    await page.getByRole("button", { name: "Sign out", exact: true }).click()
  }
})
