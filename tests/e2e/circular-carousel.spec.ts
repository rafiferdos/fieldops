import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import {
  reachWorkspaceControl,
  clickWorkspaceControl,
} from "./helpers/workspace-motion"

for (const colorScheme of ["light", "dark"] as const) {
  test(`panorama: ${colorScheme} theme, real images, gestures, keyboard and stopped frames`, async ({
    page,
  }) => {
    test.setTimeout(90000)
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      // SSR geometry must hydrate cleanly, including fractional strip sizes and transforms.
      if (message.type() === "error") errors.push(message.text())
    })
    await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/")
    await expect(page.locator("[data-public-scroll]")).toHaveAttribute(
      "data-scroll-mode",
      "smooth"
    )
    const carousel = page.getByRole("region", {
      name: "Service care panorama",
      exact: true,
    })
    const section = page.locator("[data-care-panorama]")
    const ring = carousel.locator(".circular-carousel__ring")
    await reachWorkspaceControl(page, section)
    await expect(carousel).toHaveAttribute("data-ready", "")
    // Five local scenes share optimized resources across their eight original curved strips.
    await expect
      .poll(() =>
        carousel
          .locator(".circular-carousel__photo")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0
            )
          )
      )
      .toBe(true)
    const resources = await carousel
      .locator(".circular-carousel__photo")
      .evaluateAll((images) => [
        ...new Set(
          images.map((image) =>
            image instanceof HTMLImageElement ? image.currentSrc : ""
          )
        ),
      ])
    expect(resources).toHaveLength(5)
    expect(
      resources.every((src) =>
        src.includes("/_next/image?url=%2Fimages%2Fpanorama%2F")
      )
    ).toBe(true)
    const start = await ring.getAttribute("style")
    await page.mouse.move(0, 0)
    await expect.poll(() => ring.getAttribute("style")).not.toBe(start)
    await expect(carousel).toHaveAttribute("data-running", "true")
    await clickWorkspaceControl(
      page,
      section.getByRole("button", { name: "Pause panorama", exact: true })
    )
    await expect(
      section.getByRole("button", { name: "Play panorama", exact: true })
    ).toHaveAttribute("aria-pressed", "true")
    await expect(carousel).toHaveAttribute("data-running", "false")
    const stopped = await ring.getAttribute("style")
    await page.waitForTimeout(350)
    expect(await ring.getAttribute("style")).toBe(stopped)
    await carousel.focus()
    await page.keyboard.press("End")
    await expect(carousel.locator(".circular-carousel__live")).toHaveText(
      "A lasting result, 5 of 5"
    )
    await page.keyboard.press("Home")
    await expect(carousel.locator(".circular-carousel__live")).toHaveText(
      "Thoughtful preparation, 1 of 5"
    )
    const bounds = await carousel.boundingBox()
    if (!bounds) throw Error("Missing panorama interaction surface")
    await page.mouse.move(
      bounds.x + bounds.width * 0.5,
      bounds.y + bounds.height * 0.5
    )
    await page.mouse.down()
    await page.mouse.move(
      bounds.x + bounds.width * 0.7,
      bounds.y + bounds.height * 0.5,
      { steps: 15 }
    )
    await expect(carousel).toHaveAttribute("data-dragging", "")
    await page.mouse.up()
    await expect(carousel).not.toHaveAttribute("data-dragging", "")
    await page.mouse.move(0, 0)
    await expect(carousel).toHaveAttribute("data-running", "false")
    const audit = await new AxeBuilder({ page })
      .include("[data-care-panorama]")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(audit.violations).toEqual([])
    await clickWorkspaceControl(
      page,
      section.getByRole("button", { name: "Play panorama", exact: true })
    )
    await page.mouse.move(0, 0)
    await expect(carousel).toHaveAttribute("data-running", "true")
    // Leaving the panorama suspends its own loop while the page keeps native vertical scrolling.
    await page.keyboard.press("End")
    await expect(carousel).not.toBeInViewport()
    await expect(carousel).toHaveAttribute("data-running", "false")
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator("[data-public-scroll]")).not.toHaveAttribute(
      "data-scroll-mode",
      "smooth"
    )
    await reachWorkspaceControl(page, carousel)
    await expect(carousel).toHaveCSS("touch-action", "pan-y")
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
      .toBe(true)
    const before = await page.evaluate(() => scrollY)
    await carousel.hover()
    await page.mouse.wheel(0, 150)
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(before)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await reachWorkspaceControl(page, carousel)
    await carousel.focus()
    await page.keyboard.press("End")
    await expect(carousel.locator(".circular-carousel__live")).toHaveText(
      "A lasting result, 5 of 5"
    )
    await expect(carousel).toHaveAttribute("data-running", "false")
    expect(errors).toEqual([])
  })
}

test("panorama keeps its generated image strip visible without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  try {
    const page = await context.newPage()
    await page.goto(process.env.E2E_BASE_URL ?? "http://localhost:3001/")
    const fallback = page.locator(".circular-carousel__fallback")
    await fallback.scrollIntoViewIfNeeded()
    await expect(fallback).toBeVisible()
    await expect(fallback.getByRole("img")).toHaveCount(5)
    await expect
      .poll(() =>
        fallback
          .getByRole("img")
          .first()
          .evaluate(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0
          )
      )
      .toBe(true)
  } finally {
    await context.close()
  }
})
