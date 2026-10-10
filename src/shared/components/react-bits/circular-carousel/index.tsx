"use client"

import Image from "next/image"
import type React from "react"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type {
  CircularCarouselProps,
  CircularCarouselItem,
  Tile,
  Settings,
} from "./types"
import {
  PRESETS,
  INTRO_LENGTH,
  TILES,
  OVERLAP,
  DRAG_THRESHOLD,
  clamp,
  cssNumber,
} from "./geometry"
import { useCircularCarouselEngine } from "./use-carousel-engine"
import { Digits } from "./digits"
import "./circular-carousel.css"

const motionQuery = "(prefers-reduced-motion: reduce)"
function subscribeMotion(notify: () => void) {
  const media = window.matchMedia(motionQuery)
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

// Source-reviewed React Bits panorama: preserve its geometry and gestures, with Next.js images.
export function CircularCarousel({
  items,
  preset = "cylinder",
  intro = "rise",
  cardWidth = 220,
  aspectRatio = 1,
  gap = 25,
  curve,
  tilt,
  perspective,
  autoplay = "drift",
  speed = 14,
  interval = 3,
  direction = "left",
  draggable = true,
  momentum = 0.6,
  snap = true,
  pauseOnHover = true,
  focusOnClick = true,
  parallax = 0.3,
  stretch = 0.5,
  depthFade = 0.55,
  fadeColor = "#000000",
  innerShade = 0.6,
  cornerRadius = 12,
  captions = false,
  onChange,
  onItemClick,
  label = "Service care gallery",
  className = "",
  style,
}: CircularCarouselProps) {
  const list = items
  const count = list.length
  const shape = preset
  const layout = PRESETS[shape]
  const axis = layout.axis
  const tiltValue = tilt ?? layout.tilt
  const curveValue = layout.billboard ? 0 : clamp(curve ?? layout.curve, 0, 1)
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => true
  )
  const [ready, setReady] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const cardW = Math.max(40, cardWidth)
  const cardH = cardW / clamp(aspectRatio, 0.2, 5)
  const along = axis === "x" ? cardH : cardW
  const step = 360 / count

  const radius = useMemo(() => {
    const n = Math.max(count, 3)
    const pitch = (along + gap) * layout.spread
    const chord = pitch / (2 * Math.sin(Math.PI / n))
    const arc = (n * pitch) / (2 * Math.PI)
    return Math.max(chord + (arc - chord) * curveValue, along * 0.6)
  }, [count, along, gap, curveValue, layout.spread])

  const tiles = useMemo<Tile[]>(() => {
    const total = curveValue > 0.001 ? TILES : 1
    const length = along / total
    const bend = curveValue > 0.001 ? radius / curveValue : 0
    return Array.from({ length: total }, (_, index) => {
      const start = index * length - (index > 0 ? OVERLAP / 2 : 0)
      const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0)
      const center = (start + end) / 2 - along / 2
      const alpha = bend ? center / bend : 0
      const shift = bend ? bend * Math.sin(alpha) : center
      const sink = bend ? bend * (1 - Math.cos(alpha)) : 0
      const depth = layout.inward ? sink : -sink
      const turn = ((layout.inward ? -alpha : alpha) * 180) / Math.PI
      const move =
        axis === "x"
          ? `translate3d(0px, ${cssNumber(shift)}px, ${cssNumber(depth)}px) rotateX(${cssNumber(-turn)}deg)`
          : `translate3d(${cssNumber(shift)}px, 0px, ${cssNumber(depth)}px) rotateY(${cssNumber(turn)}deg)`
      return { index, total, start, end, size: end - start, move }
    })
  }, [along, axis, curveValue, layout.inward, radius])

  const settings: Settings = {
    count,
    step,
    radius,
    layout,
    axis,
    tilt: tiltValue,
    perspective: layout.inward ? radius : (perspective ?? layout.perspective),
    cardW,
    cardH,
    intro: reduced ? "none" : intro in INTRO_LENGTH ? intro : "rise",
    autoplay: reduced ? "off" : autoplay,
    speed,
    interval: Math.max(0.5, interval),
    draggable,
    momentum: clamp(momentum, 0, 1),
    snap,
    pauseOnHover,
    parallax: reduced ? 0 : clamp(parallax, 0, 1),
    stretch: reduced ? 0 : clamp(stretch, 0, 1),
    depthFade: clamp(depthFade, 0, 1),
    captions,
    reduced,
  }
  const directionSign =
    (direction === "right" ? 1 : -1) * (layout.inward ? -1 : 1)
  const {
    rootRef,
    stageRef,
    cameraRef,
    ringRef,
    cardRefs,
    stateRef,
    wakeRef,
    activeRef,
    active,
    focusIndex,
    stepBy,
  } = useCircularCarouselEngine(settings, ready, directionSign, onChange)
  const loadedSources = useRef("")
  const sourcesKey = list.map((item) => item.src).join("|")
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    const sources = sourcesKey.split("|")
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || loadedSources.current === sourcesKey)
          return
        loadedSources.current = sourcesKey
        observer.disconnect()
        // Preload the same optimized URLs as the strips, near the viewport rather than at page entry.
        const images = sources.map(
          (src) =>
            new Promise<void>((resolve) => {
              const image = new window.Image()
              image.decoding = "async"
              image.onload = () => {
                // An already-loaded photo can paint when an optional decode is rejected.
                void image.decode().then(resolve, () => resolve())
              }
              image.onerror = () => resolve()
              image.src = src
            })
        )
        const budget = new Promise<void>((resolve) => {
          timeout = setTimeout(resolve, 2400)
        })
        void Promise.race([Promise.all(images), budget]).then(() => {
          clearTimeout(timeout)
          if (!cancelled) setReady(true)
        })
      },
      { rootMargin: "300px" }
    )
    observer.observe(root)
    return () => {
      cancelled = true
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [rootRef, sourcesKey])
  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const pointer = stateRef.current.pointer
    pointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
    pointer.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = stateRef.current
    state.suppressClick = false
    if (!draggable || event.button !== 0) return
    state.press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      angle: state.angle,
      moved: false,
      origin: 0,
      samples: [{ time: performance.now(), angle: state.angle }],
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = stateRef.current
    if (event.pointerType === "mouse") {
      state.pointer.inside = true
      updatePointer(event)
    }
    const press = state.press
    if (!press || press.id !== event.pointerId) {
      wakeRef.current()
      return
    }
    const s = settings
    const delta =
      s.axis === "x" ? event.clientY - press.y : event.clientX - press.x
    const cross =
      s.axis === "x" ? event.clientX - press.x : event.clientY - press.y
    if (!press.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return
      if (
        Math.abs(cross) > Math.abs(delta) * 1.2 &&
        event.pointerType !== "mouse"
      ) {
        state.press = null
        return
      }
      press.moved = true
      press.origin = delta
      state.drag = true
      state.target = null
      state.velocity = 0
      setDragging(true)
      // A pointer can be cancelled by native touch scrolling before capture is available.
      if (event.currentTarget.isConnected)
        event.currentTarget.setPointerCapture(event.pointerId)
    }
    const perPixel = 180 / (Math.PI * s.radius * state.fit)
    state.angle =
      press.angle +
      (delta - press.origin) * perPixel * (s.layout.inward ? -1 : 1)
    const now = performance.now()
    press.samples.push({ time: now, angle: state.angle })
    while (
      press.samples.length > 2 &&
      now - (press.samples[0]?.time ?? now) > 110
    )
      press.samples.shift()
    wakeRef.current()
  }

  const releasePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = stateRef.current
    const press = state.press
    if (!press || press.id !== event.pointerId) return
    state.press = null
    if (!press.moved) return
    state.drag = false
    setDragging(false)
    state.suppressClick = true
    const s = settings
    const first = press.samples[0]
    const last = press.samples.at(-1)
    if (!first || !last) return
    const span = (last.time - first.time) / 1000
    const cancelled =
      event.type === "pointercancel" || event.type === "lostpointercapture"
    const velocity =
      !cancelled && !reduced && span > 0.008
        ? clamp((last.angle - first.angle) / span, -1400, 1400)
        : 0
    state.velocity = velocity
    if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity)
    const coasting =
      s.autoplay === "drift" &&
      !(s.pauseOnHover && state.hover && event.pointerType === "mouse")
    if (s.snap && !coasting) {
      const tau = 0.18 + s.momentum * 1.5
      state.target =
        Math.round((state.angle + velocity * tau * 0.55) / s.step) * s.step
    }
    wakeRef.current()
  }

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return
    stateRef.current.hover = true
    wakeRef.current()
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = stateRef.current
    if (event.pointerType === "mouse") {
      state.hover = false
      state.pointer.inside = false
    }
    wakeRef.current()
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const state = stateRef.current
    if (state.suppressClick) {
      state.suppressClick = false
      return
    }
    const card =
      event.target instanceof Element
        ? event.target.closest("[data-cc-index]")
        : null
    if (!card) return
    const index = Number(card.getAttribute("data-cc-index"))
    const item = list[index]
    if (!item || !Number.isInteger(index)) return
    if (focusOnClick) focusIndex(index)
    onItemClick?.(item, index)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const forward = axis === "x" ? "ArrowDown" : "ArrowRight"
    const backward = axis === "x" ? "ArrowUp" : "ArrowLeft"
    if (event.key === forward) stepBy(1)
    else if (event.key === backward) stepBy(-1)
    else if (event.key === "Home") focusIndex(0)
    else if (event.key === "End") focusIndex(count - 1)
    else if (event.key === "Enter" || event.key === " ") {
      const item = list[activeRef.current]
      if (!item || !onItemClick) return
      onItemClick(item, activeRef.current)
    } else return
    event.preventDefault()
  }

  const current = list[active] || list[0]
  const currentLabel = current
    ? current.title || current.alt || `Image ${active + 1}`
    : ""

  const renderTile = (
    item: CircularCarouselItem,
    tile: Tile,
    back: boolean
  ) => {
    const strip = back ? tile.total - 1 - tile.index : tile.index
    const first = strip === 0
    const last = strip === tile.total - 1
    const r = "var(--cc-radius)"
    const frameRadius =
      axis === "x"
        ? `${first ? r : 0} ${first ? r : 0} ${last ? r : 0} ${last ? r : 0}`
        : `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`
    const offset = back ? along - tile.end : tile.start
    const size = tile.size
    const box: React.CSSProperties =
      axis === "x"
        ? {
            left: cssNumber(-cardW / 2),
            top: cssNumber(-size / 2),
            width: cssNumber(cardW),
            height: cssNumber(size),
          }
        : {
            left: cssNumber(-size / 2),
            top: cssNumber(-cardH / 2),
            width: cssNumber(size),
            height: cssNumber(cardH),
          }
    const photoStyle: React.CSSProperties =
      axis === "x"
        ? {
            left: 0,
            top: cssNumber(-offset),
            width: cssNumber(cardW),
            height: cssNumber(cardH),
          }
        : {
            left: cssNumber(-offset),
            top: 0,
            width: cssNumber(cardW),
            height: cssNumber(cardH),
          }
    const flip = axis === "x" ? " rotateX(180deg)" : " rotateY(180deg)"
    return (
      <div
        key={`${back ? "b" : "f"}${tile.index}`}
        className="circular-carousel__tile"
        style={{ ...box, transform: tile.move + (back ? flip : "") }}
        aria-hidden="true"
      >
        <div
          className="circular-carousel__frame"
          style={{
            height: cssNumber(axis === "x" ? size : cardH),
            borderRadius: frameRadius,
          }}
        >
          <Image
            className="circular-carousel__photo"
            src={item.src}
            width={400}
            height={300}
            unoptimized
            loading={ready ? "eager" : "lazy"}
            alt=""
            draggable={false}
            decoding="async"
            style={photoStyle}
          />
          {back && <div className="circular-carousel__inner" />}
          <div className="circular-carousel__shade" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={`circular-carousel ${className}`.trim()}
      style={
        {
          ...style,
          "--cc-fade": fadeColor,
          "--cc-radius": `${Math.max(0, cornerRadius)}px`,
          "--cc-inner": (1 - clamp(innerShade, 0, 1)).toFixed(3),
        } satisfies React.CSSProperties &
          Record<string, string | number | undefined>
      }
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      data-motion-managed=""
      data-axis={axis}
      data-shape={shape}
      data-ready={ready ? "" : undefined}
      data-draggable={draggable ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onFocus={() => {
        stateRef.current.focused = true
        setFocused(true)
        wakeRef.current()
      }}
      onBlur={() => {
        stateRef.current.focused = false
        setFocused(false)
        wakeRef.current()
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* A real image strip is visible before hydration or while optimized photos load. */}
      <div className="circular-carousel__fallback" aria-hidden={ready}>
        {list.map((item) => (
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt ?? ""}
            width={400}
            height={300}
            unoptimized
          />
        ))}
      </div>
      <div className="circular-carousel__view" aria-hidden={!ready}>
        <div ref={stageRef} className="circular-carousel__stage">
          <div ref={cameraRef} className="circular-carousel__camera">
            <div ref={ringRef} className="circular-carousel__ring">
              {list.map((item, index) => (
                <div
                  key={index}
                  ref={(element) => {
                    cardRefs.current[index] = element
                  }}
                  className="circular-carousel__card"
                  data-cc-index={index}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${item.title || item.alt || `Image ${index + 1}`}, ${index + 1} of ${count}`}
                >
                  {tiles.map((tile) => renderTile(item, tile, false))}
                  {layout.backfaces &&
                    tiles.map((tile) => renderTile(item, tile, true))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {captions && current && (
        <div className="circular-carousel__caption" aria-hidden="true">
          <span key={active} className="circular-carousel__title">
            {current.title || current.alt}
            {current.subtitle && (
              <span className="circular-carousel__subtitle">
                {current.subtitle}
              </span>
            )}
          </span>
          <span className="circular-carousel__count">
            <Digits value={active + 1} />
            <span className="circular-carousel__slash">/</span>
            <span>{String(count).padStart(2, "0")}</span>
          </span>
        </div>
      )}
      <div
        className="circular-carousel__live"
        aria-live={autoplay === "off" || focused || reduced ? "polite" : "off"}
        aria-atomic="true"
      >
        {`${currentLabel}, ${active + 1} of ${count}`}
      </div>
    </div>
  )
}
