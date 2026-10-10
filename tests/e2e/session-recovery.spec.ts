import { expect, test } from "@playwright/test"

test("theme bootstrap preserves saved choice across navigation and reload", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark")
  })
  await page.goto("/about")
  await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  await page
    .getByRole("button", { name: "Toggle light and dark theme" })
    .click()
  await expect(page.locator("html")).toHaveClass(/\blight\b/)
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Services", exact: true })
    .click()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.locator("html")).toHaveClass(/\blight\b/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/\blight\b/)
  expect(errors).toEqual([])
})

test("a session outage preserves its cookie, exposes recovery and denies private data", async ({
  context,
  page,
  baseURL,
}) => {
  // Run only against an isolated frontend whose Redis endpoint is deliberately unavailable.
  test.skip(
    process.env.E2E_SESSION_OUTAGE !== "1",
    "Requires an isolated outage host"
  )
  if (!baseURL) throw new Error("A browser-test base URL is required")
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  const id = "x".repeat(43)
  await context.addCookies([
    { name: "fieldops-session", value: id, url: baseURL, httpOnly: true },
  ])
  for (const pathname of ["/", "/login", "/account", "/admin"]) {
    await page.goto(pathname)
    await expect(
      page.getByRole("heading", {
        name: "Your session is temporarily unavailable",
      })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Reload page" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Refresh dashboard" })
    ).toHaveCount(0)
  }
  const response = await page.request.get("/api/workspace/overview")
  expect(response.status()).toBe(503)
  expect(response.headers()["cache-control"]).toBe("private, no-store")
  expect(await response.json()).toEqual({
    ok: false,
    message: "Live workspace data is unavailable. Please try again.",
  })
  await page.getByRole("button", { name: "Reload page" }).click()
  await expect(
    page.getByRole("heading", {
      name: "Your session is temporarily unavailable",
    })
  ).toBeVisible()
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === "fieldops-session"
    )?.value
  ).toBe(id)
  expect(errors).toEqual([])
})
