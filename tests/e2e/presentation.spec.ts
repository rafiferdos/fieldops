import { expect, test } from "@playwright/test"

test("headline preserves unclipped word geometry throughout entry and route return", async ({
  page,
}) => {
  const start = new Date("2026-10-09T00:00:00Z")
  await page.clock.install({ time: start })
  await page.clock.pauseAt(new Date(start.getTime() + 100))
  const title = page.getByRole("heading", {
    name: "Less chasing. More handled.",
    exact: true,
  })
  const words = title.locator("[data-hero-word]")
  const geometry = () =>
    title.evaluate((node) =>
      Array.from(
        node.querySelectorAll<HTMLElement>("[data-hero-word]"),
        (word) => ({
          text: word.textContent,
          left: word.offsetLeft,
          top: word.offsetTop,
          width: word.offsetWidth,
          height: word.offsetHeight,
        })
      )
    )
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/")
    await expect(words).toHaveCount(4)
    await page.evaluate(() => document.fonts.ready)
    // Hydration can schedule work on the clock; advance until the entry actually starts.
    await expect
      .poll(async () => {
        await page.clock.runFor(16)
        return Number(
          await words.first().evaluate((node) => getComputedStyle(node).opacity)
        )
      })
      .toBeLessThan(1)
    const initial = await geometry()
    // Sample the actual tween, including completion, instead of only its final appearance.
    for (const elapsed of [160, 240, 400, 600]) {
      await page.clock.runFor(elapsed)
      expect(await geometry(), `Stable word layout at ${width}px`).toEqual(
        initial
      )
      expect(
        await title.evaluate((node) =>
          Array.from(node.querySelectorAll("[data-hero-word]")).every(
            (word) => {
              let ancestor: Element | null = word
              while (ancestor && ancestor !== node.parentElement) {
                const style = getComputedStyle(ancestor)
                if (
                  style.overflowX !== "visible" ||
                  style.overflowY !== "visible"
                )
                  return false
                ancestor = ancestor.parentElement
              }
              return true
            }
          )
        )
      ).toBe(true)
    }
    for (const word of await words.all()) {
      await expect(word).toHaveCSS("opacity", "1")
      await expect(word).toHaveCSS("transform", "none")
    }
  }
  await page.clock.resume()
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "FAQ", exact: true })
    .click()
  await expect(page).toHaveURL(/\/faq$/)
  await page.goBack()
  await expect(title).toBeVisible()
  await expect(words).toHaveCount(4)
})

test("reduced motion restores hero words and all scroll transforms", async ({
  page,
}) => {
  await page.goto("/")
  await page.locator("[data-service-scene]").scrollIntoViewIfNeeded()
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const selector of [
    "[data-scene-image]",
    "[data-scene-card]",
    "[data-tool]",
  ]) {
    await expect
      .poll(() =>
        page
          .locator(selector)
          .evaluate((node) => getComputedStyle(node).transform)
      )
      .toBe("none")
  }
  await expect(
    page.getByRole("heading", {
      name: "Less chasing. More handled.",
      exact: true,
    })
  ).toBeVisible()
})

test("navigation uses themed CSS frost without an optical runtime", async ({
  page,
}) => {
  await page.goto("/faq")
  const surface = page.locator("header .frosted-nav")
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (theme) =>
        document.documentElement.classList.toggle("dark", theme === "dark"),
      theme
    )
    await expect(surface).toHaveCSS(
      "backdrop-filter",
      "blur(20px) saturate(1.4)"
    )
    await expect(surface).toHaveCSS("background-color", /\/\s*0\.76\)/)
    await expect(surface.locator("filter, canvas")).toHaveCount(0)
    await expect(
      page.getByRole("link", { name: "Sign in", exact: true })
    ).toBeVisible()
  }
})

test("increased contrast removes frost and keeps navigation usable", async ({
  page,
}) => {
  await page.emulateMedia({ contrast: "more" })
  await page.goto("/faq")
  const surface = page.locator("header .frosted-nav")
  await expect(surface).toHaveCSS("backdrop-filter", "none")
  expect(
    await surface.evaluate((node) => getComputedStyle(node).backgroundColor)
  ).not.toContain("/ 0.76")
  await page.emulateMedia({ contrast: "no-preference" })
  await expect(surface).toHaveCSS("backdrop-filter", "blur(20px) saturate(1.4)")
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true })
    .click()
  await expect(page).toHaveURL(/\/services$/)
})

test("every card answer fits at narrow widths and keeps its close control available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/faq")
  for (const label of ["Toggle light and dark theme", "Open navigation"]) {
    const bounds = await page
      .getByRole("button", { name: label, exact: true })
      .boundingBox()
    expect(bounds?.width).toBeGreaterThanOrEqual(44)
    expect(bounds?.height).toBeGreaterThanOrEqual(44)
  }
  const controls = page.locator(".faq-trigger")
  await expect(controls).toHaveCount(5)
  for (const control of await controls.all()) {
    // Composed triggers must retain square, touch-friendly geometry.
    const bounds = await control.boundingBox()
    expect(bounds?.width).toBeGreaterThanOrEqual(44)
    expect(bounds?.height).toBeGreaterThanOrEqual(44)
    await control.click()
    await expect(control).toHaveAttribute("aria-expanded", "true")
    const card = control.locator("..")
    await expect(card.locator(".faq-answer")).toBeVisible()
    expect(
      await card.evaluate((node) => {
        const panel = node.querySelector(".faq-answer")
        const paragraphs = panel?.querySelectorAll("p")
        const answer = paragraphs?.[1]
        const button = node.querySelector("button")
        if (!panel || !answer || !button)
          throw new Error("FAQ composition is incomplete")
        return (
          panel.scrollHeight <= panel.clientHeight &&
          answer.getBoundingClientRect().bottom <
            button.getBoundingClientRect().top
        )
      })
    ).toBe(true)
    await control.click()
    await expect(control).toBeFocused()
  }
})

test("shadcn filter popup supports keyboard selection, dismissal and form submission", async ({
  page,
}) => {
  await page.goto("/services")
  const sort = page.getByRole("combobox", { name: "Sort by", exact: true })
  await sort.focus()
  await page.keyboard.press("ArrowDown")
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(sort).toBeFocused()
  await sort.click()
  await page
    .getByRole("option", { name: "Price: low to high", exact: true })
    .click()
  await page.getByRole("button", { name: "Apply filters" }).click()
  await expect(page).toHaveURL(/sort=price_asc/)
  await expect(
    page
      .getByRole("combobox", { name: "Sort by" })
      .locator('[data-slot="select-value"]')
  ).toHaveText("Price: low to high")
})

// Native keyboard scrolling, skip links and route history must survive desktop smoothing.
test("desktop scroll keeps navigation fixed, content reachable and route history usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  // Wait for actual streamed content and fonts before testing the settled document range.
  await page.evaluate(() => document.fonts.ready)
  await expect(
    page.getByRole("link", { name: "View service", exact: true }).first()
  ).toBeVisible()
  const nav = page.locator("header .frosted-nav")
  const initial = await nav.boundingBox()
  await page.mouse.wheel(0, 1600)
  await expect.poll(async () => (await nav.boundingBox())?.y).toBe(initial?.y)
  await page.keyboard.press("End")
  await expect
    .poll(() =>
      page
        .getByRole("contentinfo")
        .evaluate((node) => node.getBoundingClientRect().bottom)
    )
    .toBeLessThanOrEqual(901)
  await page.keyboard.press("Home")
  await page.getByRole("link", { name: "Skip to main content" }).focus()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/#main-content$/)
  await expect(
    page.getByRole("heading", { name: "Less chasing. More handled." })
  ).toBeInViewport()
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "FAQ", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "A little clarity, before you book." })
  ).toBeVisible()
  // The streamed heading can precede the router's history commit.
  await expect(page).toHaveURL(/\/faq$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/#main-content$/)
  await expect(
    page.getByRole("heading", { name: "Less chasing. More handled." })
  ).toBeVisible()
})

// Frost changes its reading surface under contrast preferences, without dimming foreground text.
test("workflow surfaces use consistent frost and an opaque contrast fallback", async ({
  page,
}) => {
  await page.goto("/login")
  const surface = page.locator(".workflow-surface")
  await expect(surface).toHaveCSS("backdrop-filter", "blur(18px) saturate(1.2)")
  await expect(
    page.getByText("Illustrated workflow", { exact: true })
  ).toHaveCount(0)
  await page.emulateMedia({ contrast: "more" })
  await expect(surface).toHaveCSS("backdrop-filter", "none")
  await expect(surface.getByText("A visit, with a clear plan.")).toBeVisible()
})
