import { expect, test } from "@playwright/test"

test("headline retains its name and removes clipping masks after entry", async ({
  page,
}) => {
  await page.goto("/")
  const title = page.getByRole("heading", {
    name: "Less chasing. More handled.",
    exact: true,
  })
  await expect(title).toBeVisible()
  await expect
    .poll(() => title.locator("[style*='overflow: clip']").count())
    .toBe(0)
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "FAQ", exact: true })
    .click()
  await expect(page).toHaveURL(/\/faq$/)
  await page.goBack()
  await expect(title).toBeVisible()
  await expect
    .poll(() => title.locator("[style*='overflow: clip']").count())
    .toBe(0)
})

test("reduced motion restores split text and all scroll transforms", async ({
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

test("navigation lens bends pixels beyond the identical blur-only reference", async ({
  page,
}) => {
  await page.goto("/faq")
  const lens = page.locator("header [data-optics]")
  await expect(lens).toHaveAttribute("data-optics", "refraction")
  // Controlled stripes expose spatial displacement; blur and tint stay unchanged.
  await page.evaluate(() => {
    const backdrop = document.createElement("div")
    backdrop.style.cssText =
      "position:fixed;inset:0;z-index:30;background:repeating-linear-gradient(90deg,#111 0 4px,#fafafa 4px 8px)"
    document.body.append(backdrop)
  })
  const refracted = await lens.screenshot()
  await lens
    .locator("feDisplacementMap")
    .evaluate((node) => node.setAttribute("scale", "0"))
  const blurred = await lens.screenshot()
  const difference = await page.evaluate(
    async ({ a, b }) => {
      async function decode(source: string) {
        const image = new Image()
        image.src = `data:image/png;base64,${source}`
        await image.decode()
        const canvas = document.createElement("canvas")
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext("2d")
        if (!context) throw new Error("Pixel inspection is unavailable")
        context.drawImage(image, 0, 0)
        return {
          width: image.width,
          height: image.height,
          data: context.getImageData(0, 0, image.width, image.height).data,
        }
      }
      const first = await decode(a),
        second = await decode(b)
      let changed = 0
      for (let index = 0; index < first.data.length; index += 4) {
        const delta = Math.abs(
          (first.data[index] ?? 0) - (second.data[index] ?? 0)
        )
        if (delta > 8) changed++
      }
      return { changed, pixels: first.width * first.height }
    },
    { a: refracted.toString("base64"), b: blurred.toString("base64") }
  )
  expect(difference.changed).toBeGreaterThan(difference.pixels * 0.02)
})

test("increased contrast removes the optical layer and keeps navigation usable", async ({
  page,
}) => {
  await page.emulateMedia({ contrast: "more" })
  await page.goto("/faq")
  await expect(page.locator("header [data-optics]")).toHaveAttribute(
    "data-optics",
    "translucent"
  )
  await expect
    .poll(() =>
      page
        .locator("header .liquid-lens-material")
        .evaluate((node) => getComputedStyle(node).backdropFilter)
    )
    .toBe("none")
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
