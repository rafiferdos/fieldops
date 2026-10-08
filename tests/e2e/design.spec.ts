import { expect, test } from "@playwright/test"

// These checks exercise progressive enhancement and accessibility, not animation internals.
test("public content remains readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${baseURL ?? "http://localhost:3001"}/`)
    await expect(
      page.getByRole("heading", { name: "Less chasing. More handled." })
    ).toBeVisible()
    // Frost is CSS-only and must remain available before any client scripts run.
    await expect(page.locator("header .frosted-nav")).toHaveCSS(
      "backdrop-filter",
      "blur(20px) saturate(1.4)"
    )
    await expect(
      page.getByRole("link", { name: "Explore services", exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("The service journey", { exact: true })
    ).toBeVisible()
    await page
      .getByRole("link", { name: "See how it works", exact: true })
      .click()
    await expect(
      page.getByRole("heading", {
        name: "One service journey. Three clear roles.",
      })
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test("reduced motion shows all content and suppresses entry movement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  for (const element of await page.locator("[data-reveal]").all()) {
    await element.scrollIntoViewIfNeeded()
    await expect(element).toBeVisible()
    expect(
      await element.evaluate(
        (node) =>
          node
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === "running").length
      )
    ).toBe(0)
  }
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.reload()
  await page
    .getByRole("heading", { name: "Take one thing off your list." })
    .scrollIntoViewIfNeeded()
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(
    page.getByRole("link", { name: "Find your service" })
  ).toBeVisible()
})

test("FAQ disclosure supports keyboard operation and retains focus", async ({
  page,
}) => {
  await page.goto("/faq")
  const question = page.getByRole("button", {
    name: "Can I change or cancel my request?",
  })
  await question.focus()
  await page.keyboard.press("Enter")
  await expect(question).toHaveAttribute("aria-expanded", "true")
  await expect(
    page.getByText("You can edit your own pending request.", { exact: false })
  ).toBeVisible()
  await page.keyboard.press("Space")
  await expect(question).toHaveAttribute("aria-expanded", "false")
  await expect(question).toBeFocused()
})

test("password visibility is explicit and preserves the entered value", async ({
  page,
}) => {
  await page.goto("/register")
  const password = page.getByLabel("Password", { exact: true })
  await password.fill("Preview-only-password")
  await page.getByRole("button", { name: "Show password", exact: true }).click()
  await expect(password).toHaveAttribute("type", "text")
  await expect(password).toHaveValue("Preview-only-password")
  await page.getByRole("button", { name: "Hide password", exact: true }).click()
  await expect(password).toHaveAttribute("type", "password")
})

test("public and authentication screens fit narrow and intermediate viewports", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const pathname of [
      "/",
      "/services",
      "/about",
      "/faq",
      "/login",
      "/register",
    ]) {
      await page.goto(pathname)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        ),
        `${pathname} at ${width}px`
      ).toBe(true)
    }
  }
})

// Sample rendered CSS colors through the browser so modern color spaces are respected.
test("small brand text has readable contrast in both themes", async ({
  page,
}) => {
  await page.goto("/")
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.classList.toggle("dark", value === "dark")
    }, theme)
    const contrast = await page
      .locator(".eyebrow")
      .first()
      .evaluate((element) => {
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 1
        const context = canvas.getContext("2d")
        if (!context) throw new Error("Canvas colors are unavailable")
        const luminance = (color: string) => {
          context.clearRect(0, 0, 1, 1)
          context.fillStyle = color
          context.fillRect(0, 0, 1, 1)
          const channels = Array.from(context.getImageData(0, 0, 1, 1).data)
            .slice(0, 3)
            .map((channel) => {
              const value = channel / 255
              return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4
            })
          return (
            (channels[0] ?? 0) * 0.2126 +
            (channels[1] ?? 0) * 0.7152 +
            (channels[2] ?? 0) * 0.0722
          )
        }
        const text = luminance(getComputedStyle(element).color)
        const background = luminance(
          getComputedStyle(document.body).backgroundColor
        )
        return (
          (Math.max(text, background) + 0.05) /
          (Math.min(text, background) + 0.05)
        )
      })
    expect(contrast, `${theme} brand contrast`).toBeGreaterThanOrEqual(4.5)
  }
})
