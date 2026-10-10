import { expect, type Locator, type Page } from "@playwright/test"

// Native wheel input settles the transformed surface before targeting a newly added control.
export async function reachWorkspaceControl(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  const wrapper = page.locator("[data-workspace-scroll], [data-public-scroll]")
  const insideContent = await control.evaluate(
    (node) =>
      node.closest(".workspace-scroll-content, .public-scroll-content") !== null
  )
  if (
    insideContent &&
    (await wrapper.count()) > 0 &&
    (await wrapper.getAttribute("data-scroll-mode")) === "smooth"
  ) {
    const bounds = await control.boundingBox()
    if (!bounds) throw Error("Missing scroll control geometry")
    const height = await page.evaluate(() => innerHeight)
    await page.mouse.wheel(0, bounds.y - height * 0.6)
    await expect(control).toBeInViewport()
    await expect
      .poll(() =>
        page
          .locator(".workspace-scroll-content, .public-scroll-content")
          .evaluate((node) =>
            Math.abs(
              new DOMMatrixReadOnly(getComputedStyle(node).transform).m42 +
                window.scrollY
            )
          )
      )
      .toBeLessThan(2)
  } else {
    await control.scrollIntoViewIfNeeded()
    await expect(control).toBeInViewport()
  }
}

// Move the authoritative window scroller; hidden-wrapper auto-scroll cannot position a hit target.
export async function clickWorkspaceControl(page: Page, control: Locator) {
  await reachWorkspaceControl(page, control)
  await control.click()
}

// Verify native scrolling and transformed content, rather than a configuration flag alone.
export async function verifyWorkspaceMotion(page: Page, responsive: boolean) {
  const wrapper = page.locator("[data-workspace-scroll]")
  const content = page.locator(".workspace-scroll-content")
  const header = page.locator(".workspace-header")
  const dashboardLink = page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
  const dashboardIcon = dashboardLink.locator("svg")
  await expect(wrapper).toHaveAttribute("data-scroll-mode", "smooth")
  await expect(wrapper).toHaveCSS("position", "fixed")
  const surface = page.locator(".workspace-scroll-surface")
  // The reading surface must extend below the viewport, without a false panel-ending shadow.
  await expect(page.locator('[data-slot="sidebar-inset"]')).toHaveCSS(
    "box-shadow",
    "none"
  )
  await expect
    .poll(async () => {
      const bounds = await surface.boundingBox()
      return bounds
        ? bounds.height - (await page.evaluate(() => window.innerHeight))
        : 0
    })
    .toBeGreaterThan(100)
  const initial = await header.boundingBox()
  if (!initial) throw new Error("The workspace header must be visible")
  // Original unboxed link feedback preserves its stable, accessible hit target.
  const linkBounds = await dashboardLink.boundingBox()
  await dashboardLink.hover()
  await expect(dashboardIcon).toHaveCSS("transform", "none")
  await expect(dashboardLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  expect(await dashboardLink.boundingBox()).toEqual(linkBounds)
  await dashboardLink.focus()
  await expect(dashboardLink).toBeFocused()
  await expect(dashboardLink).toHaveAttribute("aria-current", "page")
  await page.getByText("Your workspace", { exact: true }).click()
  await page.mouse.wheel(0, 480)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100)
  await expect
    .poll(() =>
      content.evaluate((node) =>
        Math.abs(
          new DOMMatrixReadOnly(getComputedStyle(node).transform).m42 +
            window.scrollY
        )
      )
    )
    .toBeLessThan(2)
  await expect.poll(async () => (await header.boundingBox())?.y).toBe(initial.y)
  await page.keyboard.press("End")
  await expect(
    page.getByRole("link", { name: "All visits", exact: true })
  ).toBeInViewport()
  await expect
    .poll(async () => {
      const panel = await surface.boundingBox()
      const lastLink = await page
        .getByRole("link", { name: "All visits", exact: true })
        .boundingBox()
      return panel && lastLink
        ? panel.y + panel.height - lastLink.y - lastLink.height
        : -1
    })
    .toBeGreaterThanOrEqual(0)
  await page.getByRole("button", { name: "Toggle workspace sidebar" }).click()
  await expect
    .poll(async () => (await header.boundingBox())?.x)
    .toBeLessThan(initial.x)
  await page.getByRole("button", { name: "Toggle workspace sidebar" }).click()
  await expect.poll(async () => (await header.boundingBox())?.x).toBe(initial.x)
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    )
    .toBe(true)

  if (responsive) {
    // Preference changes dispose transforms immediately and restore the native layout.
    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect(wrapper).not.toHaveAttribute("data-scroll-mode", "smooth")
    await expect(content).toHaveCSS("transform", "none")
    await dashboardLink.hover()
    await expect(dashboardIcon).toHaveCSS("transform", "none")
    await page.getByText("Your workspace", { exact: true }).click()
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await expect(wrapper).toHaveAttribute("data-scroll-mode", "smooth")
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(wrapper).not.toHaveAttribute("data-scroll-mode", "smooth")
    await expect(content).toHaveCSS("transform", "none")
    await page.getByRole("button", { name: "Toggle workspace sidebar" }).click()
    await expect(
      page.getByRole("dialog", { name: "Sidebar", exact: true })
    ).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(
      page.getByRole("dialog", { name: "Sidebar", exact: true })
    ).not.toBeVisible()
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(wrapper).toHaveAttribute("data-scroll-mode", "smooth")
  }
  await page.keyboard.press("Home")
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport()
}

// Portalled confirmations keep the native page locked and stay outside the transformed surface.
export async function verifyWorkspaceDialogLock(page: Page) {
  const dialog = page.getByRole("dialog", {
    name: "Sign out of FieldOps?",
  })
  await expect(dialog).toBeInViewport()
  expect(
    await dialog.evaluate(
      (node) => node.closest("[data-workspace-scroll]") === null
    )
  ).toBe(true)
  const before = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 400)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before)
}
