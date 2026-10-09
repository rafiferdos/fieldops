import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { expect, test } from "@playwright/test"

test("home photo panels preserve readable geometry and solid contrast fallbacks", async ({
  page,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" })
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/")
      const scene = page.locator("[data-scene-card]")
      await expect(scene.getByText("Tell us what needs care.")).toBeVisible()
      expect(
        await scene.evaluate((node) => node.scrollWidth <= node.clientWidth)
      ).toBe(true)
      for (const card of await page.locator(".faq-card").all()) {
        await card.scrollIntoViewIfNeeded()
        expect(
          await card.evaluate((node) => {
            const heading = node.querySelector(".faq-summary h3")
            const control = node.querySelector("button")
            const summary = node.querySelector(".faq-summary")
            if (!heading || !control || !summary)
              throw new Error("The photo panel is incomplete")
            return (
              heading.getBoundingClientRect().bottom <
                control.getBoundingClientRect().top &&
              summary.scrollWidth <= summary.clientWidth &&
              summary.getBoundingClientRect().top >=
                node.getBoundingClientRect().top
            )
          })
        ).toBe(true)
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
    }
    await page.emulateMedia({ contrast: "more", reducedMotion: "reduce" })
    for (const panel of await page.locator(".image-glass").all()) {
      await expect(panel).toHaveCSS("backdrop-filter", "none")
    }
    const trigger = page.locator(".faq-trigger").first()
    await trigger.focus()
    await page.keyboard.press("Enter")
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    const answer = page.locator(".faq-answer").first()
    await expect(answer).toBeVisible()
    await expect(answer).toHaveCSS("backdrop-filter", "none")
    await page.keyboard.press("Enter")
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await page.emulateMedia({ contrast: "no-preference" })
  }
})

test("home light effects follow the pointer without moving cards and dispose on motion changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const card = page.locator("[data-spotlight]").first()
  await card.scrollIntoViewIfNeeded()
  // Let entry and scroll settling finish before measuring the pointer's stable hit surface.
  await expect
    .poll(() => card.evaluate((node) => getComputedStyle(node).transform))
    .toBe("none")
  await card.hover({ position: { x: 80, y: 100 } })
  await expect(card).toHaveAttribute("data-spotlight-active", "")
  const bounds = await card.boundingBox()
  if (!bounds) throw new Error("The spotlight card has no rendered geometry")
  await card.hover({ position: { x: 140, y: 140 } })
  await expect
    .poll(() =>
      card.evaluate((node) => node.style.getPropertyValue("--spotlight-x"))
    )
    .not.toBe("")
  const moved = await card.boundingBox()
  expect(moved?.width).toBe(bounds.width)
  expect(moved?.height).toBe(bounds.height)
  await page.mouse.move(0, 0)
  await expect(card).not.toHaveAttribute("data-spotlight-active")
  await expect
    .poll(() =>
      card.evaluate((node) => node.style.getPropertyValue("--spotlight-x"))
    )
    .toBe("")

  const glass = page.locator("[data-scene-card]")
  await glass.scrollIntoViewIfNeeded()
  await glass.hover()
  await expect
    .poll(() =>
      glass.evaluate(
        (node) => getComputedStyle(node, "::after").backgroundPosition
      )
    )
    .toBe("100% 100%")
  await expect(glass).toHaveCSS("cursor", "auto")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await card.hover()
  await expect(card).not.toHaveAttribute("data-spotlight-active")
  await expect
    .poll(() =>
      card.evaluate((node) => getComputedStyle(node, "::before").opacity)
    )
    .toBe("0")
  await expect
    .poll(() =>
      glass.evaluate(
        (node) => getComputedStyle(node, "::after").backgroundPosition
      )
    )
    .toBe("-100% -100%")
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await card.hover()
  await expect(card).toHaveAttribute("data-spotlight-active", "")
})

test("touch and script-free browsing retain the complete home journey", async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error("A browser-test base URL is required")
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled,
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    })
    try {
      const page = await context.newPage()
      await page.goto("/")
      const card = page.locator("[data-spotlight]").first()
      await card.scrollIntoViewIfNeeded()
      await card.tap()
      await expect(card).not.toHaveAttribute("data-spotlight-active")
      await expect(page.getByText("Start with what you need.")).toBeVisible()
      await page.locator(".faq-card").first().scrollIntoViewIfNeeded()
      if (javaScriptEnabled) {
        await page.locator(".faq-trigger").first().tap()
        await expect(page.locator(".faq-answer").first()).toBeVisible()
      } else {
        await expect(page.locator("noscript").first()).toBeVisible()
      }
      await expect(
        page.getByRole("link", { name: "Find your service" })
      ).toBeVisible()
    } finally {
      await context.close()
    }
  }
})

test("capture home material proof when explicitly enabled", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_VISUAL_PROOF !== "1",
    "Optional public visual proof"
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)
  const directory = resolve(process.cwd(), "../delivery")
  await mkdir(directory, { recursive: true })
  // Capture real rendered public surfaces; no private records or test account identity.
  await page.locator("[data-service-scene]").screenshot({
    path: resolve(directory, "fieldops-home-glass-scene.png"),
  })
  await page
    .locator(".faq-card")
    .first()
    .screenshot({
      path: resolve(directory, "fieldops-home-glass-faq.png"),
    })
})
