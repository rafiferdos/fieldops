import type { CSSProperties } from "react"

export interface CircularCarouselItem {
  src: string
  alt?: string
  title?: string
  subtitle?: string
}

export type CircularCarouselPreset = "cylinder" | "orbit" | "wheel" | "panorama"
export type CircularCarouselIntro = "assemble" | "rise" | "spin" | "none"
export type CircularCarouselAutoplay = "drift" | "step" | "off"

export interface CircularCarouselProps {
  items: readonly CircularCarouselItem[]
  preset?: CircularCarouselPreset
  intro?: CircularCarouselIntro
  cardWidth?: number
  aspectRatio?: number
  gap?: number
  curve?: number
  tilt?: number
  perspective?: number
  autoplay?: CircularCarouselAutoplay
  speed?: number
  interval?: number
  direction?: "left" | "right"
  draggable?: boolean
  momentum?: number
  snap?: boolean
  pauseOnHover?: boolean
  focusOnClick?: boolean
  parallax?: number
  stretch?: number
  depthFade?: number
  fadeColor?: string
  innerShade?: number
  cornerRadius?: number
  captions?: boolean
  onChange?: (index: number) => void
  onItemClick?: (item: CircularCarouselItem, index: number) => void
  label?: string
  className?: string
  style?: CSSProperties
}

export type Vec3 = [number, number, number]

export interface Layout {
  axis: "x" | "y"
  tilt: number
  perspective: number
  curve: number
  spread: number
  inward: boolean
  billboard: boolean
  backfaces: boolean
  window: number
}

export interface Tile {
  index: number
  total: number
  start: number
  end: number
  size: number
  move: string
}

export interface Sample {
  time: number
  angle: number
}

export interface Press {
  id: number
  x: number
  y: number
  angle: number
  moved: boolean
  origin: number
  samples: Sample[]
}

export interface CarouselState {
  angle: number
  velocity: number
  target: number | null
  dir: number
  press: Press | null
  drag: boolean
  hover: boolean
  focused: boolean
  pointer: { inside: boolean; x: number; y: number }
  yaw: number
  pitch: number
  intro: { type: CircularCarouselIntro; start: number } | null
  introDone: boolean
  holdUntil: number
  stepAt: number
  suppressClick: boolean
  wheelTimer: ReturnType<typeof setTimeout> | undefined
  fit: number
  shift: number
  drop: number
  last: number
}

export interface Settings {
  count: number
  step: number
  radius: number
  layout: Layout
  axis: "x" | "y"
  tilt: number
  perspective: number
  cardW: number
  cardH: number
  intro: CircularCarouselIntro
  autoplay: CircularCarouselAutoplay
  speed: number
  interval: number
  draggable: boolean
  momentum: number
  snap: boolean
  pauseOnHover: boolean
  parallax: number
  stretch: number
  depthFade: number
  captions: boolean
  reduced: boolean
}

export interface IntroPose {
  radius: number
  lift: number
}
