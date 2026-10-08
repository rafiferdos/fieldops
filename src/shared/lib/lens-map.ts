const REFRACTIVE_INDEX = 1.5
export const LENS_DISPLACEMENT = 24

// Encode a rounded convex bezel's refracted ray into the SVG filter's RG channels.
export function createLensMap(
  width: number,
  height: number
): Uint8ClampedArray {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 960 ||
    height > 160
  ) {
    throw new RangeError(
      "Lens dimensions must fit the bounded navigation surface"
    )
  }
  const pixels = new Uint8ClampedArray(width * height * 4)
  const radius = Math.min(width, height) / 2
  const bezel = Math.min(16, radius * 0.55)
  const eta = 1 / REFRACTIVE_INDEX

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - width / 2
      const dy = y + 0.5 - height / 2
      const qx = Math.abs(dx) - (width / 2 - radius)
      const qy = Math.abs(dy) - (height / 2 - radius)
      const ex = Math.max(qx, 0)
      const ey = Math.max(qy, 0)
      const edgeLength = Math.hypot(ex, ey)
      const distance = radius - edgeLength - Math.min(Math.max(qx, qy), 0)
      let shiftX = 0
      let shiftY = 0

      if (distance > 0 && distance < bezel && edgeLength > 0) {
        const depth = distance / bezel
        const curve = Math.sqrt(1 - (1 - depth) ** 2)
        const slope = (1 - depth) / Math.max(curve, 0.001)
        const normalLength = Math.hypot(slope, 1)
        const normalZ = 1 / normalLength
        // Snell's law for an orthogonal viewing ray entering a curved glass surface.
        const refraction =
          eta * normalZ - Math.sqrt(1 - eta ** 2 * (1 - normalZ ** 2))
        const rayZ = eta + refraction * normalZ
        const travel = (bezel * curve + 3) / Math.max(rayZ, 0.1)
        const lateral = (refraction * slope * travel) / normalLength
        shiftX = (Math.sign(dx) * ex * lateral) / edgeLength
        shiftY = (Math.sign(dy) * ey * lateral) / edgeLength
      }

      const offset = (y * width + x) * 4
      pixels[offset] = 128 + (127 * shiftX) / LENS_DISPLACEMENT
      pixels[offset + 1] = 128 + (127 * shiftY) / LENS_DISPLACEMENT
      pixels[offset + 2] = 128
      pixels[offset + 3] = 255
    }
  }
  return pixels
}
