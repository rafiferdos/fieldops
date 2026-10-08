import { randomUUID } from "node:crypto"
import { expect, test } from "@playwright/test"
import { respectAuthWindow } from "./helpers/auth-window"
import { expectReadableStatusLabels } from "./helpers/contrast"

test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})

test("real catalog search/sort, empty state, URL history and service entry", async ({
  page,
}) => {
  const failures: string[] = []
  page.on("pageerror", (error) => failures.push(error.message))
  await page.goto("/services")
  await expect(
    page.getByRole("heading", { name: "What needs attention?" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "View service" }).first()
  ).toBeVisible()
  await page.getByLabel("Search services").fill("no-match-" + randomUUID())
  await page.getByLabel("Sort by").selectOption("price_asc")
  await page.getByRole("button", { name: "Apply filters" }).click()
  await expect(page).toHaveURL(/sort=price_asc/)
  await expect(
    page.getByRole("heading", { name: "No matching services" })
  ).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole("link", { name: "View service" }).first()
  ).toBeVisible()
  await page.getByRole("link", { name: "View service" }).first().click()
  await expect(
    page.getByRole("heading", { name: "About this service" })
  ).toBeVisible()
  await page.getByRole("link", { name: "Request this service" }).click()
  await expect(page).toHaveURL(/\/login\?returnTo=/)
  expect(new URL(page.url()).searchParams.get("returnTo")).toContain(
    "/customer/requests/new?serviceId="
  )
  expect(failures).toEqual([])
})

test("mobile navigation, keyboard access, theme and narrow-screen layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("link", { name: "Skip to main content" })
  ).toBeFocused()
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await expect(
    page.getByRole("button", { name: "Open navigation", exact: true })
  ).toBeFocused()
  await page
    .getByRole("button", { name: "Toggle light and dark theme" })
    .click()
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click()
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Services", exact: true })
    .click()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.getByRole("dialog")).not.toBeVisible()
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  )
  expect(fits).toBe(true)
})

test("registration validation rejects weak input before network submission", async ({
  page,
}) => {
  await page.goto("/register")
  await page.getByLabel("Full name").fill("A")
  await page.getByLabel("Email address").fill("invalid")
  await page.getByLabel("Password", { exact: true }).fill("short")
  await page.getByRole("button", { name: "Create customer account" }).click()
  await expect(page.getByRole("alert").first()).toBeVisible()
  await expect(page).toHaveURL(/\/register$/)
})

test.describe("configured demo accounts", () => {
  test.skip(
    process.env.E2E_DEMO_ACCOUNTS !== "1",
    "Requires explicitly configured local demo accounts"
  )
  for (const role of ["Customer", "Technician", "Admin"] as const) {
    test(`${role} login, role protection, cookie and logout`, async ({
      page,
      context,
    }) => {
      await page.goto("/login")
      await page
        .getByRole("button", { name: `${role} demo`, exact: true })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`/${role.toLowerCase()}(?:\\?|$)`)
      )
      // Workspace navigation must fit before any operational action is attempted.
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth
          ),
          `${role} workspace at ${width}px`
        ).toBe(true)
      }
      await page.setViewportSize({ width: 390, height: 844 })
      const navigation = page.getByRole("button", {
        name: "Open workspace navigation",
      })
      await navigation.click()
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(navigation).toBeFocused()
      await page.setViewportSize({ width: 1440, height: 1000 })
      await expectReadableStatusLabels(page)
      await page
        .getByRole("button", { name: "Toggle light and dark theme" })
        .click()
      await expect(page.locator("html")).toHaveClass(/dark/)
      await expectReadableStatusLabels(page)
      await page
        .getByRole("button", { name: "Toggle light and dark theme" })
        .click()
      await expect(page.locator("html")).not.toHaveClass(/dark/)
      const cookie = (await context.cookies()).find(
        (value) => value.name === "fieldops-session"
      )
      expect(cookie?.httpOnly).toBe(true)
      expect(cookie?.sameSite).toBe("Lax")
      expect(cookie?.value).toMatch(/^[A-Za-z0-9_-]{43}$/)
      await page.goto(role === "Admin" ? "/customer" : "/admin")
      await expect(page).toHaveURL(
        new RegExp(`/${role.toLowerCase()}(?:\\?|$)`)
      )
      await page.goto("/account")
      await expect(
        page.getByRole("heading", { name: "Your account" })
      ).toBeVisible()
      await page.getByRole("button", { name: "Sign out", exact: true }).click()
      await expect(page).toHaveURL(/\/login$/)
      await page.goto("/account")
      await expect(page).toHaveURL(/\/login\?returnTo=/)
    })
  }
})

test("real disposable customer registration, request create/edit/cancel and foreign record privacy", async ({
  page,
  browser,
}) => {
  test.skip(
    process.env.E2E_LIVE_WRITES !== "1",
    "Explicit opt-in: creates a disposable customer and a cancelled request"
  )
  const marker = randomUUID(),
    password = `FieldOps-test-${randomUUID()}`
  await page.goto("/register")
  await page.getByLabel("Full name").fill("Frontend Verification")
  await page.getByLabel("Email address").fill(`frontend-${marker}@example.com`)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Create customer account" }).click()
  await expect(page).toHaveURL(/\/login\?registered=1$/)
  await page.getByLabel("Email address").fill(`frontend-${marker}@example.com`)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/customer$/)
  await page.goto("/account")
  await page
    .getByLabel("Name", { exact: true })
    .fill("Frontend Verification Updated")
  await page.getByRole("button", { name: "Save profile" }).click()
  await expect(
    page.getByText("Profile updated.", { exact: true })
  ).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Frontend Verification Updated"
  )
  await page.goto("/customer")
  await page
    .getByRole("link", { name: "New request", exact: true })
    .last()
    .click()
  await page.getByLabel("Service", { exact: true }).selectOption({ index: 1 })
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  const description = `Frontend verification ${marker}`
  await page.getByLabel("What needs attention?").fill(description)
  await page
    .getByLabel("Service address")
    .fill("Disposable verification address, Dhaka")
  const local = new Date(Date.now() + 2 * 86400000 + 6 * 3600000)
    .toISOString()
    .slice(0, 16)
  await page.getByLabel("Preferred visit time").fill(local)
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Review request" })
  ).toBeVisible()
  await expect(page).toHaveURL(/\/customer\/requests\/new$/)
  await expect(
    page.getByRole("heading", { name: "Review request" })
  ).toBeFocused()
  await page.getByRole("button", { name: "Back", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Visit details" })
  ).toBeFocused()
  await expect(page.getByLabel("What needs attention?")).toHaveValue(
    description
  )
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Submit request", exact: true })
  ).toBeEnabled()
  await page
    .getByRole("button", { name: "Submit request", exact: true })
    .click()
  await expect(page).toHaveURL(/\/customer\/requests\/[a-f0-9-]{36}$/)
  const requestUrl = page.url()
  const stale = await page.context().newPage()
  try {
    await stale.goto(requestUrl)
    await page
      .getByLabel("Description", { exact: true })
      .fill(description + " updated")
    await page.getByRole("button", { name: "Save request" }).click()
    await expect(
      page.locator("dd").filter({ hasText: description + " updated" })
    ).toBeVisible()
    await stale
      .getByLabel("Description", { exact: true })
      .fill(description + " stale change")
    await stale.getByRole("button", { name: "Save request" }).click()
    await expect(
      stale.getByRole("alert").filter({ hasText: "This record has changed" })
    ).toBeVisible()
    await expect(
      stale.getByRole("button", { name: "Save request" })
    ).toBeDisabled()
    await expect(
      stale.getByRole("button", { name: "Reload latest request" })
    ).toBeVisible()
  } finally {
    await stale.close()
    await page
      .getByRole("button", { name: "Cancel request", exact: true })
      .click()
    await expect(page.getByRole("alertdialog")).toBeVisible()
    await page
      .getByLabel("Reason for cancellation")
      .fill("Disposable frontend verification completed")
    await page.getByRole("button", { name: "Confirm cancellation" }).click()
    await expect(page.getByText("CANCELLED", { exact: true })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Cancel request", exact: true })
    ).not.toBeVisible()
  }

  const other = await browser.newContext({
      baseURL: new URL(requestUrl).origin,
    }),
    foreign = await other.newPage()
  try {
    await foreign.goto("/login")
    await foreign
      .getByRole("button", { name: "Customer demo", exact: true })
      .click()
    await expect(foreign).toHaveURL(/\/customer$/)
    await foreign.goto(requestUrl)
    await expect(
      foreign.getByRole("heading", { name: "Page not found" })
    ).toBeVisible()
    await expect(foreign.getByText(description)).not.toBeVisible()
    await foreign.goto("/account")
    await foreign.getByRole("button", { name: "Sign out", exact: true }).click()
    await expect(foreign).toHaveURL(/\/login$/)
  } finally {
    await other.close()
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
})
