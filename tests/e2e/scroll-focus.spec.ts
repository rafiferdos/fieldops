import { expect, test } from "@playwright/test"

test("smooth scrolling keeps offscreen keyboard focus and subsequent pointer clicks aligned", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/faq")
  const wrapper = page.locator("[data-public-scroll]")
  const content = page.locator(".public-scroll-content")
  await expect(wrapper).toHaveAttribute("data-scroll-mode", "smooth")
  const trigger = page.locator(".faq-trigger").last()
  await trigger.focus()
  await expect(trigger).toBeInViewport()
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
  await trigger.click()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  expect(await wrapper.evaluate((node) => node.scrollTop)).toBe(0)
  await trigger.click()
  await expect(trigger).toHaveAttribute("aria-expanded", "false")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(wrapper).not.toHaveAttribute("data-scroll-mode")
  await expect(wrapper).not.toHaveCSS("overflow", "clip")
})
