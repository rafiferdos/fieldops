import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { expect, test, type Locator, type Page } from "@playwright/test"

// Native wheel input keeps GSAP's scroll source authoritative; forced wrapper scrolling does not.
async function scrollWithWheel(page: Page, target: Locator) {
  const bounds = await target.boundingBox()
  const viewport = page.viewportSize()
  if (!bounds || !viewport)
    throw new Error("The scroll target has no viewport geometry")
  await page.mouse.move(viewport.width - 24, viewport.height / 2)
  await page.mouse.wheel(0, bounds.y - viewport.height * 0.35)
  await expect(target).toBeInViewport()
  await expect
    .poll(async () => (await target.boundingBox())?.y ?? Infinity)
    .toBeLessThan(viewport.height * 0.5)
}

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
  await expect(page.locator("[data-public-scroll]")).toHaveAttribute(
    "data-scroll-mode",
    "smooth"
  )
  const card = page.locator("[data-spotlight]").first()
  await scrollWithWheel(page, card)
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
  await scrollWithWheel(page, glass)
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

test("scroll typography resolves early and restores native words for reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const title = page.locator("#services-title")
  await expect(page.locator("[data-public-scroll]")).toHaveAttribute(
    "data-scroll-mode",
    "smooth"
  )
  await scrollWithWheel(page, title)
  await expect
    .poll(() =>
      title.locator("[data-scroll-word]").evaluateAll((words) =>
        words.every((word) => {
          const style = getComputedStyle(word)
          return (
            style.opacity === "1" &&
            new DOMMatrixReadOnly(style.transform).isIdentity
          )
        })
      )
    )
    .toBe(true)
  await expect(title).toHaveAccessibleName(
    "The right help. A better starting point."
  )
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const word of await page.locator("[data-scroll-word]").all()) {
    await expect(word).toHaveCSS("transform", "none")
  }
})

test("ambient waves render only while visible and restore a still motion fallback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const stage = page.locator(".coordination-stage")
  await expect(page.locator("[data-public-scroll]")).toHaveAttribute(
    "data-scroll-mode",
    "smooth"
  )
  const waves = page.locator("canvas.coordination-waves")
  const pixels = () =>
    waves.evaluate((node) => {
      if (!(node instanceof HTMLCanvasElement))
        throw new Error("Missing wave canvas")
      const context = node.getContext("2d")
      if (!context)
        throw new Error("Canvas 2D is unavailable in the test browser")
      const { data } = context.getImageData(0, 0, node.width, node.height)
      let hash = 0
      for (const byte of data) hash = (Math.imul(hash, 31) + byte) | 0
      return hash
    })
  await scrollWithWheel(page, stage)
  const initial = await pixels()
  await expect.poll(pixels).not.toBe(initial)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(
    page.locator("#next-step-title [data-scroll-word]").first()
  ).toHaveCSS("transform", "none")
  await expect(stage).toBeInViewport()
  const still = await pixels()
  // Sample elapsed frames to verify actual rendered output stops, not just a CSS label.
  await page.waitForTimeout(250)
  expect(await pixels()).toBe(still)
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await expect(page.locator("[data-public-scroll]")).toHaveAttribute(
    "data-scroll-mode",
    "smooth"
  )
  await expect(stage).toBeInViewport()
  await expect.poll(pixels).not.toBe(still)
  await page.keyboard.press("Home")
  await expect(stage).not.toBeInViewport()
  await page.waitForTimeout(250)
  const outside = await pixels()
  await page.waitForTimeout(250)
  expect(await pixels()).toBe(outside)
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "FAQ", exact: true })
    .click()
  await expect(page).toHaveURL(/\/faq$/)
  await page.goBack()
  await scrollWithWheel(page, stage)
  const returned = await pixels()
  await expect.poll(pixels).not.toBe(returned)
  await page.setViewportSize({ width: 390, height: 844 })
  await scrollWithWheel(page, stage)
  await page.waitForTimeout(250)
  const narrow = await pixels()
  await page.waitForTimeout(250)
  expect(await pixels()).toBe(narrow)
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
  await page.locator(".coordination-stage").screenshot({
    path: resolve(directory, "fieldops-home-waves-cta.png"),
  })
})
