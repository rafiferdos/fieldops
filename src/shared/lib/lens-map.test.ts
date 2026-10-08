import { describe, expect, it } from "vitest"
import { createLensMap } from "./lens-map"

describe("navigation lens optics", () => {
  it("keeps the reading plane neutral and bends opposite rims symmetrically", () => {
    const width = 160
    const height = 64
    const pixels = createLensMap(width, height)
    const sample = (x: number, y: number, channel: number) =>
      pixels[(y * width + x) * 4 + channel] ?? -1
    expect(sample(80, 32, 0)).toBe(128)
    expect(sample(80, 32, 1)).toBe(128)
    expect(sample(2, 32, 0)).not.toBe(128)
    expect(sample(2, 32, 0) + sample(157, 32, 0)).toBe(256)
    expect(sample(80, 2, 1) + sample(80, 61, 1)).toBe(256)
    expect(sample(80, 2, 1)).not.toBe(128)
  })

  it("encodes every pixel opaquely without exceeding the allocation budget", () => {
    const pixels = createLensMap(900, 80)
    expect(pixels.byteLength).toBe(900 * 80 * 4)
    for (let offset = 3; offset < pixels.length; offset += 4) {
      expect(pixels[offset]).toBe(255)
    }
  })

  it.each([
    [0, 64],
    [160, 0],
    [961, 64],
    [160, 161],
    [120.5, 64],
    [NaN, 64],
  ])(
    "rejects unsupported geometry %s x %s before allocating",
    (width, height) => {
      expect(() => createLensMap(width, height)).toThrow(RangeError)
    }
  )
})
