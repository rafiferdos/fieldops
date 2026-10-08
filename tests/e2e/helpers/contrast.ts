import { expect, type Page } from "@playwright/test"

// Composite actual browser colors so translucent status surfaces are included.
export async function expectReadableStatusLabels(page: Page) {
  const samples = await page.locator(".status-badge").evaluateAll((elements) =>
    elements.map((element) => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Browser color sampling is unavailable")
      const base = getComputedStyle(document.body).backgroundColor
      const card = element.closest('[data-slot="card"]')
      const parent = card ? getComputedStyle(card).backgroundColor : base
      const style = getComputedStyle(element)
      const luminance = (color: string, background?: string) => {
        context.clearRect(0, 0, 1, 1)
        for (const layer of [base, parent, background, color]) {
          if (!layer) continue
          context.fillStyle = layer
          context.fillRect(0, 0, 1, 1)
        }
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
      const background = luminance(style.backgroundColor)
      const text = luminance(style.color, style.backgroundColor)
      return {
        status: element.getAttribute("data-status"),
        ratio:
          (Math.max(text, background) + 0.05) /
          (Math.min(text, background) + 0.05),
      }
    })
  )
  for (const sample of samples) {
    expect(
      sample.ratio,
      `${sample.status ?? "Status"} label contrast`
    ).toBeGreaterThanOrEqual(4.5)
  }
}
