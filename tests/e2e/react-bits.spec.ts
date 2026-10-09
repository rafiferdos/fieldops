import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { expect, test } from "@playwright/test"

test("desktop elastic navigation follows each real link slot", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/faq")
  const navigation = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  })
  const thumb = page.locator("[data-rubber-thumb]")
  const track = page.locator("[data-rubber-segment]")
  for (const name of ["Services", "How it works", "FAQ", "Contact"]) {
    const link = navigation.getByRole("link", { name, exact: true })
    await link.focus()
    const expected = await link.evaluate((node) => {
      const root = node.closest("[data-rubber-segment]")
      if (!root) throw Error("Missing track geometry")
      return (
        node.getBoundingClientRect().left -
        root.getBoundingClientRect().left -
        3
      )
    })
    await expect
      .poll(() =>
        thumb.evaluate((node, target) => {
          const clip = getComputedStyle(node).clipPath.match(
            /inset\(0px [\d.]+px 0px ([\d.]+)px/
          )
          return Math.abs(Number(clip?.[1]) - target)
        }, expected)
      )
      .toBeLessThan(1)
  }
  await navigation.getByRole("link", { name: "Contact", exact: true }).click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(
    navigation.getByRole("link", { name: "Contact", exact: true })
  ).toHaveAttribute("aria-current", "page")
  await expect(track).toBeVisible()
})

test("mobile staggered navigation keeps its modal focus and real route links", async ({
  page,
}) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/faq")
    const trigger = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    })
    if (width === 768) {
      await expect(trigger).not.toBeVisible()
      continue
    }
    await trigger.click()
    const menu = page.getByRole("navigation", {
      name: "Mobile navigation",
      exact: true,
    })
    await expect(menu).toBeVisible()
    expect(
      await menu.evaluate((node) => node.scrollWidth <= node.clientWidth)
    ).toBe(true)
    for (const [name, href] of [
      ["Services", "/services"],
      ["How it works", "/about"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ]) {
      if (!name || !href) throw Error("Missing navigation expectation")
      await expect(
        menu.getByRole("link", { name, exact: true })
      ).toHaveAttribute("href", href)
    }
    await expect
      .poll(() =>
        menu
          .locator("[data-menu-label]")
          .evaluateAll((nodes) =>
            nodes.every((node) => getComputedStyle(node).transform === "none")
          )
      )
      .toBe(true)
    // Original numbering scales with the narrow-screen text rather than overlapping it.
    expect(
      await menu.locator("a").evaluateAll((nodes) =>
        nodes.every((node) => {
          const label = node.querySelector("[data-menu-label]")
          const number = node.querySelector("[aria-hidden=true]")
          if (!label || !number) throw Error("Missing menu label or number")
          const range = document.createRange()
          range.selectNodeContents(label)
          const line = range.getClientRects()[0]
          return (
            line !== undefined &&
            line.right + 2 <= number.getBoundingClientRect().left
          )
        })
      )
    ).toBe(true)
    await page.keyboard.press("Escape")
    await expect(menu).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await menu.getByRole("link", { name: "Contact", exact: true }).click()
    await expect(page).toHaveURL(/\/contact$/)
    await expect(menu).not.toBeVisible()
  }
})

test("public viewport blur yields to keyboard focus and the complete footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/about")
  const edge = page.locator(".gradual-blur-page")
  await expect(edge).toBeVisible()
  await expect(edge.locator("div")).toHaveCount(5)
  await expect(edge).toHaveCSS("pointer-events", "none")
  await page.getByRole("link", { name: "Skip to main content" }).focus()
  await expect(edge).toHaveCSS("opacity", "0")
  await page.getByRole("heading", { level: 1 }).click()
  await page.keyboard.press("End")
  await expect(edge).toHaveAttribute("data-at-end", "")
  await expect(page.getByRole("contentinfo")).toBeInViewport()
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(edge).not.toBeVisible()
})

test("stacked process cards restore their native reading order for reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const stack = page.locator(".scroll-stack")
  await expect(stack).toHaveAttribute("data-stacking", "")
  const bounds = await stack.boundingBox()
  if (!bounds) throw Error("Stack geometry unavailable")
  await page.mouse.wheel(0, bounds.y + 300)
  const cards = stack.locator('[data-slot="card"]')
  await expect(cards).toHaveCount(3)
  await expect
    .poll(() =>
      cards
        .first()
        .evaluate(
          (node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m11
        )
    )
    .toBeLessThan(1)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(stack).not.toHaveAttribute("data-stacking")
  for (const card of await cards.all())
    await expect(card).toHaveCSS("transform", "none")
  expect(
    await cards.evaluateAll((nodes) =>
      nodes.every(
        (node, index) =>
          index === 0 ||
          node.getBoundingClientRect().top >
            (nodes[index - 1]?.getBoundingClientRect().bottom ?? 0)
      )
    )
  ).toBe(true)
})

test("hero tech glyphs remain inside their canvas and restore native text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  const text = page.locator(".tech-text")
  await expect(text).toHaveAttribute("data-tech-ready", "")
  const pixels = () =>
    text.locator("canvas").evaluate((node) => {
      if (!(node instanceof HTMLCanvasElement))
        throw Error("Missing TechText canvas")
      const context = node.getContext("2d")
      if (!context) throw Error("Missing Canvas 2D")
      const data = context.getImageData(0, 0, node.width, node.height).data
      let hash = 0
      for (const byte of data) hash = (Math.imul(hash, 31) + byte) | 0
      return hash
    })
  const initial = await pixels()
  await expect.poll(pixels).not.toBe(initial)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(text.locator(".tech-text-native")).toHaveCSS("opacity", "1")
  await expect(text.locator("canvas")).not.toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Less chasing. More handled.",
      exact: true,
    })
  ).toBeVisible()
})

test("lost WebGL contexts leave static decoration and readable content", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  for (const kind of ["crystal", "strands"]) {
    const artwork = page.locator(`[data-artwork="${kind}"]`)
    const bounds = await artwork.boundingBox()
    if (!bounds) throw Error("Missing artwork geometry")
    await page.mouse.wheel(0, bounds.y - 200)
    const canvas = artwork.locator("canvas")
    await expect(canvas).toBeVisible()
    await canvas.evaluate((node) => {
      if (!(node instanceof HTMLCanvasElement)) throw Error("Missing canvas")
      const extension = node
        .getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
      if (!extension) throw Error("Missing context-loss extension")
      extension.loseContext()
    })
    await expect(canvas).toHaveCount(0)
    await expect(artwork.locator(".animated-artwork__fallback")).toBeVisible()
  }
  await expect(
    page.getByRole("link", { name: "Find your service", exact: true })
  ).toBeVisible()
  expect(errors).toEqual([])
})

test("capture actual React Bits compositions when explicitly enabled", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_VISUAL_PROOF !== "1",
    "Optional public visual proof"
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/")
  await expect(page.locator(".tech-text")).toHaveAttribute(
    "data-tech-ready",
    ""
  )
  await page.evaluate(() => document.fonts.ready)
  await expect
    .poll(() =>
      page
        .locator("[data-hero-word]")
        .evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).opacity === "1")
        )
    )
    .toBe(true)
  const directory = resolve(process.cwd(), "../delivery")
  await mkdir(directory, { recursive: true })
  await page
    .locator(".hero-title")
    .screenshot({ path: resolve(directory, "fieldops-tech-text.png") })
  const crystal = page.locator('[data-artwork="crystal"]')
  const crystalBounds = await crystal.boundingBox()
  if (!crystalBounds) throw Error("Missing crystal geometry")
  await page.mouse.wheel(0, crystalBounds.y - 300)
  await expect(crystal.locator("canvas")).toBeVisible()
  // Visual evidence captures the original one-second shader introduction after it resolves.
  await page.waitForTimeout(1200)
  await page
    .locator("[data-border-glow]")
    .screenshot({ path: resolve(directory, "fieldops-crystal-roles.png") })
  const strands = page.locator('[data-artwork="strands"]')
  const strandBounds = await strands.boundingBox()
  if (!strandBounds) throw Error("Missing strand geometry")
  await page.mouse.wheel(0, strandBounds.y - 300)
  await expect(strands.locator("canvas")).toBeVisible()
  await page
    .locator(".coordination-stage")
    .screenshot({ path: resolve(directory, "fieldops-strands.png") })
  await page.setViewportSize({ width: 390, height: 844 })
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click()
  await expect
    .poll(() =>
      page
        .locator("[data-menu-label]")
        .evaluateAll(
          (nodes) =>
            nodes.length > 0 &&
            nodes.every((node) => getComputedStyle(node).transform === "none")
        )
    )
    .toBe(true)
  await page
    .getByRole("dialog", { name: "Main navigation", exact: true })
    .screenshot({ path: resolve(directory, "fieldops-staggered-menu.png") })
})
