import { expect, test } from "@playwright/test"

// Verify rendered tags and a real service identity, rather than mirroring metadata helpers.
test("public pages share descriptive previews and keep private work out of the sitemap", async ({
  page,
}) => {
  let canonicalOrigin: string | undefined
  for (const [pathname, title] of [
    ["/", "Home"],
    ["/about", "How it works"],
    ["/services", "Services"],
    ["/faq", "Frequently asked questions"],
    ["/contact", "Contact"],
  ] as const) {
    await page.goto(pathname)
    await expect(page).toHaveTitle(`${title} | FieldOps`)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      `${title} | FieldOps`
    )
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S.{30}/
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/images\/editorial\/service-still-life\.png$/
    )
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href")
    if (!canonical) throw new Error("A canonical public URL is required")
    const url = new URL(canonical)
    canonicalOrigin ??= url.origin
    expect(url.origin).toBe(canonicalOrigin)
    expect(url.pathname).toBe(pathname)
    expect(url.search).toBe("")
    if (process.env.E2E_EXPECTED_ORIGIN)
      expect(url.origin).toBe(process.env.E2E_EXPECTED_ORIGIN)
  }
  await page.goto("/services")
  await page
    .getByRole("link", { name: "View service", exact: true })
    .first()
    .click()
  // Client navigation must finish before reading the detail heading as its identity.
  await expect(page).toHaveURL(/\/services\/[\da-f-]{36}$/)
  await expect(
    page.getByRole("link", { name: "Back to services", exact: true })
  ).toBeVisible()
  const name = await page.getByRole("heading", { level: 1 }).innerText()
  await expect(page).toHaveTitle(`${name} | FieldOps`)
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    `${name} | FieldOps`
  )
  const sitemap = await page.request.get("/sitemap.xml")
  expect(sitemap.ok()).toBe(true)
  const xml = await sitemap.text()
  expect(xml).toContain(`${canonicalOrigin}/contact`)
  expect(xml).not.toMatch(
    /\/(customer|technician|admin|account|payments?)(\/|<)/
  )
  const robots = await page.request.get("/robots.txt")
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain("Disallow: /admin")
  await page.goto("/login")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow"
  )
})
