import type { CSSProperties } from "react"
import type { Texture, Mesh, RenderTarget } from "ogl"
type Preset =
  | "plasma"
  | "aurora"
  | "nebula"
  | "ember"
  | "frost"
  | "solar"
  | "eclipse"
  | "abyss"
type Motion = "rise" | "fall" | "drift" | "orbit"
type ParticleShape = "square" | "round"
type Theme = "dark" | "light"
type Rgb = [number, number, number]

interface PresetValues {
  color: string
  strands: number
  crackle: number
  flares: number
  glow: number
  sparks: number
  particleCount: number
  fill: number
  motion: Motion
  particleShape: ParticleShape
  depth: number
  sway: number
  twinkle: number
  haze: number
  dustSpeed: number
}

export interface CrystalizedBallProps extends Partial<PresetValues> {
  preset?: Preset
  theme?: Theme
  size?: number
  speed?: number
  interactive?: boolean
  hoverStrength?: number
  intro?: boolean
  paused?: boolean
  className?: string
  style?: CSSProperties
}

interface Palette {
  rim: Rgb
  rimHot: Rgb
  rimMid: Rgb
  rimDeep: Rgb
  spark: Rgb
  sparkGlow: Rgb
  haze: Rgb
  edge: Rgb
  tones: Rgb[]
}

interface Settings extends Omit<PresetValues, "color"> {
  light: boolean
  palette: Palette
  size: number
  speed: number
  interactive: boolean
  hoverStrength: number
  intro: boolean
  paused: boolean
}

interface StrandData {
  harmonics: number[]
  rates: number[]
  phases: number[]
  flareHarmonics: number[]
  flareRates: number[]
  flarePhases: number[]
}

interface Arc {
  start: number
  span: number
  curl: number
  life: number
  duration: number
  drift: number
  strength: number
}

interface DustLayer {
  requested: number
  rows: number
  home: Texture
  seed: Texture
  mesh: Mesh
  read: RenderTarget | null
  write: RenderTarget | null
}

const BALL_PRESETS: Record<Preset, PresetValues> = {
  plasma: {
    color: "#F25BD0",
    strands: 6,
    crackle: 0.85,
    flares: 0.65,
    glow: 0.9,
    sparks: 0.6,
    particleCount: 15000,
    fill: 0.5,
    motion: "rise",
    particleShape: "square",
    depth: 0.6,
    sway: 0.5,
    twinkle: 0.5,
    haze: 0.7,
    dustSpeed: 1,
  },
  aurora: {
    color: "#5CFFC8",
    strands: 5,
    crackle: 0.6,
    flares: 0.5,
    glow: 0.8,
    sparks: 0.45,
    particleCount: 15000,
    fill: 0.5,
    motion: "rise",
    particleShape: "square",
    depth: 0.6,
    sway: 0.5,
    twinkle: 0.5,
    haze: 0.7,
    dustSpeed: 1,
  },
  nebula: {
    color: "#9478FF",
    strands: 6,
    crackle: 1,
    flares: 0.5,
    glow: 0.9,
    sparks: 0.6,
    particleCount: 18000,
    fill: 0.45,
    motion: "rise",
    particleShape: "square",
    depth: 0.5,
    sway: 0.4,
    twinkle: 0.6,
    haze: 0.8,
    dustSpeed: 1.2,
  },
  ember: {
    color: "#FF8A2A",
    strands: 5,
    crackle: 0.9,
    flares: 0.8,
    glow: 1,
    sparks: 0.8,
    particleCount: 12000,
    fill: 0.35,
    motion: "rise",
    particleShape: "round",
    depth: 0.7,
    sway: 0.3,
    twinkle: 0.7,
    haze: 0.9,
    dustSpeed: 1.6,
  },
  frost: {
    color: "#BFE6FF",
    strands: 3,
    crackle: 0.3,
    flares: 0.3,
    glow: 0.6,
    sparks: 0.2,
    particleCount: 16000,
    fill: 0.6,
    motion: "fall",
    particleShape: "round",
    depth: 0.8,
    sway: 0.4,
    twinkle: 0.4,
    haze: 0.5,
    dustSpeed: 0.7,
  },
  solar: {
    color: "#FFD36E",
    strands: 6,
    crackle: 0.7,
    flares: 1,
    glow: 1.1,
    sparks: 0.5,
    particleCount: 15000,
    fill: 0.55,
    motion: "orbit",
    particleShape: "square",
    depth: 0.6,
    sway: 0.7,
    twinkle: 0.5,
    haze: 0.8,
    dustSpeed: 1,
  },
  eclipse: {
    color: "#FFFFFF",
    strands: 4,
    crackle: 0.5,
    flares: 0.4,
    glow: 0.7,
    sparks: 0.35,
    particleCount: 14000,
    fill: 0.5,
    motion: "drift",
    particleShape: "square",
    depth: 0.7,
    sway: 0.5,
    twinkle: 0.5,
    haze: 0.5,
    dustSpeed: 0.8,
  },
  abyss: {
    color: "#3F7BFF",
    strands: 5,
    crackle: 0.55,
    flares: 0.6,
    glow: 0.9,
    sparks: 0.4,
    particleCount: 20000,
    fill: 0.8,
    motion: "orbit",
    particleShape: "round",
    depth: 0.8,
    sway: 0.8,
    twinkle: 0.5,
    haze: 0.6,
    dustSpeed: 0.9,
  },
}

const MOTIONS: Record<string, number> = { rise: 0, fall: 1, drift: 2, orbit: 3 }
const SHAPES: Record<string, number> = { square: 0, round: 1 }
const MAX_STRANDS = 8
const MAX_ARCS = 4
const MAX_PARTICLES = 40000
const STATE_WIDTH = 256
const PIXEL_BUDGET = 4.5e6
const INTRO_SECONDS = 2.2
const SETTLE_SECONDS = 7
const WHITE: Rgb = [1, 1, 1]
const BLACK: Rgb = [0, 0, 0]

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
const smooth = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const mixColor = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
const wrapAngle = (a: number) =>
  a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2))

const parseColor = (value: string, fallback: Rgb): Rgb => {
  try {
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx) return fallback
    ctx.fillStyle = "#000000"
    ctx.fillStyle = value
    const resolved = ctx.fillStyle
    if (resolved.startsWith("#")) {
      const n = parseInt(resolved.slice(1), 16)
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    }
    const parts = resolved.match(/[\d.]+/g)
    if (!parts || parts.length < 3) return fallback
    return [
      Number(parts[0]) / 255,
      Number(parts[1]) / 255,
      Number(parts[2]) / 255,
    ]
  } catch {
    return fallback
  }
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
const toGamma = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055

const toOklab = (rgb: Rgb): Rgb => {
  const [r, g, b]: Rgb = [toLinear(rgb[0]), toLinear(rgb[1]), toLinear(rgb[2])]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const fromOklab = ([L, a, b]: Rgb): Rgb => {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3)
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3)
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3)
  const values: Rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  const gamma = (v: number) => clamp(toGamma(clamp(v, 0, 1)), 0, 1)
  return [gamma(values[0]), gamma(values[1]), gamma(values[2])]
}

const blend = (a: Rgb, b: Rgb, t: number): Rgb =>
  fromOklab(mixColor(toOklab(a), toOklab(b), t))

const shift = (
  rgb: Rgb,
  hue: number,
  lightness: number,
  chroma: number
): Rgb => {
  const [L, a, b] = toOklab(rgb)
  const c = Math.hypot(a, b) * chroma
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180
  return fromOklab([
    clamp(L + lightness, 0, 1),
    c * Math.cos(h),
    c * Math.sin(h),
  ])
}

const withLightness = (
  rgb: Rgb,
  hue: number,
  lightness: number,
  chroma: number
): Rgb => {
  const [, a, b] = toOklab(rgb)
  const c = Math.max(Math.hypot(a, b) * chroma, 0.02)
  const h = Math.atan2(b, a) + (hue * Math.PI) / 180
  return fromOklab([clamp(lightness, 0, 1), c * Math.cos(h), c * Math.sin(h)])
}

const buildPalette = (color: Rgb, light: boolean): Palette => {
  if (light) {
    const ink = withLightness(color, 0, Math.min(toOklab(color)[0], 0.62), 1.15)
    return {
      rim: ink,
      rimHot: ink,
      rimMid: ink,
      rimDeep: withLightness(color, 0, 0.72, 0.8),
      spark: withLightness(color, 0, 0.6, 1.2),
      sparkGlow: withLightness(color, 0, 0.78, 0.8),
      haze: withLightness(color, 0, 0.8, 0.6),
      edge: withLightness(color, 0, 0.72, 0.8),
      tones: [
        withLightness(color, 0, 0.56, 1.1),
        withLightness(color, 16, 0.6, 1.05),
        withLightness(color, -16, 0.5, 1.1),
        withLightness(color, 0, 0.66, 0.9),
        withLightness(color, 0, 0.74, 0.7),
      ],
    }
  }
  return {
    rim: color,
    rimHot: mixColor(color, WHITE, 0.72),
    rimMid: mixColor(color, BLACK, 0.15),
    rimDeep: mixColor(color, BLACK, 0.45),
    spark: mixColor(color, WHITE, 0.45),
    sparkGlow: shift(color, 0, -0.15, 1),
    haze: mixColor(color, BLACK, 0.6),
    edge: shift(color, 0, -0.3, 0.9),
    tones: [
      shift(color, 0, -0.06, 1),
      shift(color, 16, -0.02, 1),
      shift(color, -16, -0.12, 1.05),
      shift(blend(color, WHITE, 0.25), 0, 0.04, 1),
      blend(color, WHITE, 0.7),
    ],
  }
}

const seeded = (start: number) => {
  let state = start >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildStrands = (): StrandData => {
  const random = seeded(99)
  const bands: [number, number, number, number][] = [
    [6, 12, 0.6, 1.6],
    [18, 34, 1.5, 3.5],
    [40, 70, 3, 7],
    [80, 130, 6, 12],
  ]
  const data: StrandData = {
    harmonics: [],
    rates: [],
    phases: [],
    flareHarmonics: [],
    flareRates: [],
    flarePhases: [],
  }
  for (let s = 0; s < MAX_STRANDS; s++) {
    bands.forEach(([low, high, slow, fast]) => {
      data.harmonics.push(Math.round(low + random() * (high - low)))
      data.rates.push(
        (slow + random() * (fast - slow)) * (random() < 0.5 ? -1 : 1)
      )
      data.phases.push(random() * Math.PI * 2)
    })
    for (let j = 0; j < 3; j++) {
      data.flareHarmonics.push(4 + Math.floor(random() * 6))
      data.flareRates.push((0.4 + random() * 0.8) * (random() < 0.5 ? -1 : 1))
      data.flarePhases.push(random() * Math.PI * 2)
    }
    const lead = s === 0
    data.flareHarmonics.push(lead ? 0.75 : 0.95 + random() * 0.3)
    data.flareRates.push(lead ? 1.15 : 0.8 + random() * 0.2)
    data.flarePhases.push(lead ? 1 : 0.7 + random() * 0.25)
  }
  return data
}

const buildDust = (count: number) => {
  const random = seeded(1337)
  const rows = Math.max(1, Math.ceil(count / STATE_WIDTH))
  const home = new Float32Array(STATE_WIDTH * rows * 4)
  const seed = new Float32Array(STATE_WIDTH * rows * 4)
  let k = 0
  let guard = 0
  while (k < count && guard < count * 80) {
    guard++
    let x: number
    let y: number
    let tone: number
    if (random() < 0.28) {
      const angle = random() * Math.PI * 2
      const radius = 0.87 + Math.sqrt(random()) * 0.105
      x = Math.cos(angle) * radius
      y = Math.sin(angle) * radius
      if (random() > smooth(-0.6, 0.3, -y)) continue
      const q = random()
      tone = q < 0.5 ? 3 : q < 0.8 ? 2 : 1
    } else {
      x = random() * 2 - 1
      y = random() * 2 - 1
      const radius = Math.hypot(x, y)
      if (radius > 0.975) continue
      const bowl = Math.pow(smooth(-0.25, 0.85, -y), 1.3)
      const band = smooth(0.66, 0.96, radius) * smooth(-0.7, 0.3, -y)
      const weight = Math.max(bowl, band * 0.9)
      if (random() > 0.012 + 0.988 * weight) continue
      if (weight < 0.12) tone = 4
      else {
        const q = random()
        tone = q < 0.32 ? 0 : q < 0.52 ? 1 : q < 0.8 ? 2 : 3
      }
    }
    const chord = Math.sqrt(Math.max(0, 0.95 - x * x - y * y))
    home[k * 4] = x
    home[k * 4 + 1] = y
    home[k * 4 + 2] = (random() * 2 - 1) * chord
    home[k * 4 + 3] = tone
    seed[k * 4] = tone === 4 ? 1.8 : random() < 0.22 ? 2.1 : 1.3
    seed[k * 4 + 1] = random()
    seed[k * 4 + 2] = 2.5 + random() * 3.5
    seed[k * 4 + 3] = 0.16 + random() * 0.26
    k++
  }
  return { home, seed, count: k, rows }
}

export {
  type Settings,
  type PresetValues,
  type DustLayer,
  type Arc,
  BALL_PRESETS,
  MAX_ARCS,
  MAX_PARTICLES,
  STATE_WIDTH,
  PIXEL_BUDGET,
  SETTLE_SECONDS,
  INTRO_SECONDS,
  MAX_STRANDS,
  clamp,
  smooth,
  easeOut,
  wrapAngle,
  parseColor,
  buildPalette,
  buildStrands,
  buildDust,
  seeded,
  MOTIONS,
  SHAPES,
}
