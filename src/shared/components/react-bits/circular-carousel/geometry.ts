import type {
  CircularCarouselPreset,
  CircularCarouselIntro,
  Layout,
  Vec3,
} from "./types"

export const PRESETS: Record<CircularCarouselPreset, Layout> = {
  cylinder: {
    axis: "y",
    tilt: -5,
    perspective: 2500,
    curve: 1,
    spread: 1,
    inward: false,
    billboard: false,
    backfaces: true,
    window: 0,
  },
  orbit: {
    axis: "y",
    tilt: -16,
    perspective: 1500,
    curve: 0,
    spread: 1.45,
    inward: false,
    billboard: true,
    backfaces: false,
    window: 0,
  },
  wheel: {
    axis: "x",
    tilt: 0,
    perspective: 1800,
    curve: 0,
    spread: 1,
    inward: false,
    billboard: false,
    backfaces: true,
    window: 1.7,
  },
  panorama: {
    axis: "y",
    tilt: 0,
    perspective: 0,
    curve: 1,
    spread: 1,
    inward: true,
    billboard: false,
    backfaces: false,
    window: 0,
  },
}

export const INTRO_LENGTH: Record<CircularCarouselIntro, number> = {
  assemble: 1500,
  rise: 1400,
  spin: 1800,
  none: 0,
}
export const TILES = 8
export const OVERLAP = 2.5
export const DRAG_THRESHOLD = 5
export const SPRING = 118
export const SETTLE_SPEED = 9
export const CAPTION_SPACE = 76
export const TO_RAD = Math.PI / 180

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
// Browser CSS serialization rounds floats; stable precision keeps SSR and hydration identical.
export const cssNumber = (value: number) => Number(value.toPrecision(5))
export const wrap = (degrees: number) =>
  ((((degrees + 180) % 360) + 360) % 360) - 180
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

export const rotateX = (p: Vec3, degrees: number): Vec3 => {
  const r = degrees * TO_RAD
  const c = Math.cos(r)
  const s = Math.sin(r)
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
}

export const rotateY = (p: Vec3, degrees: number): Vec3 => {
  const r = degrees * TO_RAD
  const c = Math.cos(r)
  const s = Math.sin(r)
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
}
