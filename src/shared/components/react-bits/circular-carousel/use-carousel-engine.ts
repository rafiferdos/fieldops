"use client"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import type {
  CircularCarouselProps,
  CarouselState,
  Settings,
  Vec3,
  IntroPose,
} from "./types"
import {
  CAPTION_SPACE,
  INTRO_LENGTH,
  SPRING,
  SETTLE_SPEED,
  TO_RAD,
  clamp,
  wrap,
  rotateX,
  rotateY,
  easeOut,
  easeOutQuint,
} from "./geometry"

// The original projection, spring and eight-strip curvature share one owned animation loop.
export function useCircularCarouselEngine(
  settings: Settings,
  ready: boolean,
  directionSign: number,
  onChange: CircularCarouselProps["onChange"]
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const wakeRef = useRef<() => void>(() => {})
  const measureRef = useRef<() => void>(() => {})
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  const readyRef = useRef(ready)
  const settingsRef = useRef(settings)
  const onChangeRef = useRef(onChange)
  const stateRef = useRef<CarouselState>({
    angle: 0,
    velocity: 0,
    target: null,
    dir: directionSign,
    press: null,
    drag: false,
    hover: false,
    focused: false,
    pointer: { inside: false, x: 0, y: 0 },
    yaw: 0,
    pitch: 0,
    intro: null,
    introDone: false,
    holdUntil: 0,
    stepAt: 0,
    suppressClick: false,
    wheelTimer: undefined,
    fit: 1,
    shift: 0,
    drop: 0,
    last: 0,
  })

  useLayoutEffect(() => {
    settingsRef.current = settings
    readyRef.current = ready
    onChangeRef.current = onChange
    wakeRef.current()
  }, [settings, ready, onChange])
  useEffect(() => {
    stateRef.current.dir = directionSign
    wakeRef.current()
  }, [directionSign])
  useLayoutEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const camera = cameraRef.current
    const ring = ringRef.current
    if (!root || !stage || !camera || !ring) return undefined
    const state = stateRef.current
    let raf = 0
    let visible = false

    const nearest = (angle: number) =>
      Math.round(angle / settingsRef.current.step) * settingsRef.current.step

    const measure = () => {
      const s = settingsRef.current
      const rect = root.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const room = s.captions ? CAPTION_SPACE : 0
      const width = rect.width * 0.94
      const height = (rect.height - room) * 0.92
      const P = s.perspective
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      if (s.layout.inward) {
        minX = -width / 2
        maxX = width / 2
        minY = -s.cardH / 2
        maxY = s.cardH / 2
      } else {
        const corners: [number, number][] = [
          [-s.cardW / 2, -s.cardH / 2],
          [s.cardW / 2, -s.cardH / 2],
          [-s.cardW / 2, s.cardH / 2],
          [s.cardW / 2, s.cardH / 2],
        ]
        const limit = s.layout.window ? s.layout.window * s.step : 180
        for (let a = -limit; a <= limit; a += limit / 24) {
          for (const [cx, cy] of corners) {
            let p: Vec3
            if (s.axis === "x") {
              p = rotateY(rotateX([cx, cy, s.radius], -a), s.tilt)
            } else if (s.layout.billboard) {
              const c = rotateY([0, 0, s.radius], a)
              p = rotateX([c[0] + cx, cy, c[2]], s.tilt)
            } else {
              p = rotateX(rotateY([cx, cy, s.radius], a), s.tilt)
            }
            p = [p[0], p[1], p[2] - s.radius]
            if (p[2] >= P * 0.95) continue
            const k = P / (P - p[2])
            minX = Math.min(minX, p[0] * k)
            maxX = Math.max(maxX, p[0] * k)
            minY = Math.min(minY, p[1] * k)
            maxY = Math.max(maxY, p[1] * k)
          }
        }
      }
      const spanX = Math.max(maxX - minX, 1)
      const spanY = Math.max(maxY - minY, 1)
      const fit = Math.min(1, width / spanX, height / spanY)
      state.fit = fit
      state.shift = -((minY + maxY) / 2) * fit - room / 2
      state.drop =
        s.axis === "x"
          ? (rect.width / fit) * 0.55 + s.cardW
          : (rect.height / fit) * 0.55 + s.cardH
      stage.style.perspective = `${P}px`
      stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${fit})`
    }
    measureRef.current = measure

    const introCard = (elapsed: number, landing: number): IntroPose => {
      if (!state.intro) return { radius: 1, lift: 0 }
      const type = state.intro.type
      const reach = Math.abs(wrap(landing + state.angle))
      if (type === "assemble") {
        const delay = (reach / 180) * 420
        const p = easeOut(clamp((elapsed - delay) / 1080, 0, 1))
        return { radius: 1 + 0.6 * (1 - p), lift: 0 }
      }
      if (type === "rise") {
        const delay = (reach / 180) * 480
        const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1))
        return { radius: 1, lift: (1 - p) * state.drop }
      }
      if (type === "spin") {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1))
        return { radius: 1 + 0.28 * (1 - p), lift: 0 }
      }
      return { radius: 1, lift: 0 }
    }

    const advance = (s: Settings, dt: number, now: number) => {
      // A live preference change resolves motion immediately, including an unfinished intro.
      if (s.reduced) {
        state.intro = null
        state.introDone = true
        state.angle = state.target ?? state.angle
        state.target = null
        state.velocity = 0
        state.yaw = 0
        state.pitch = 0
      }
      if (!state.introDone && readyRef.current) {
        if (!state.intro) {
          if (s.intro === "none") state.introDone = true
          else state.intro = { type: s.intro, start: now }
        }
        if (
          state.intro &&
          now - state.intro.start >= INTRO_LENGTH[state.intro.type]
        ) {
          state.intro = null
          state.introDone = true
        }
      }

      const paused =
        state.focused ||
        (s.pauseOnHover && state.hover) ||
        state.drag ||
        now < state.holdUntil
      const cruise =
        s.autoplay === "drift" && !paused && !state.intro
          ? s.speed * state.dir
          : 0
      let busy = Boolean(state.intro) || state.drag

      if (state.drag || state.intro) {
        state.velocity = state.drag ? state.velocity : 0
      } else if (state.target !== null) {
        let remaining = dt
        const damping = 2 * Math.sqrt(SPRING)
        while (remaining > 0) {
          const h = Math.min(remaining, 1 / 240)
          const accel =
            SPRING * (state.target - state.angle) - damping * state.velocity
          state.velocity += accel * h
          state.angle += state.velocity * h
          remaining -= h
        }
        if (
          Math.abs(state.target - state.angle) < 0.004 &&
          Math.abs(state.velocity) < 0.03
        ) {
          state.angle = state.target
          state.velocity = 0
          state.target = null
        }
        busy = true
      } else {
        const tau = 0.18 + s.momentum * 1.5
        state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau))
        state.angle += state.velocity * dt
        if (cruise === 0 && s.snap && Math.abs(state.velocity) < SETTLE_SPEED) {
          const aligned = nearest(state.angle)
          if (
            Math.abs(aligned - state.angle) > 0.004 ||
            Math.abs(state.velocity) > 0.03
          )
            state.target = aligned
          else {
            state.angle = aligned
            state.velocity = 0
          }
        }
        busy =
          busy ||
          cruise !== 0 ||
          Math.abs(state.velocity) > 0.01 ||
          state.target !== null
      }

      if (s.autoplay === "step" && !paused && !state.intro && state.introDone) {
        if (!state.stepAt) state.stepAt = now + s.interval * 1000
        if (now >= state.stepAt) {
          state.target =
            (state.target ?? nearest(state.angle)) + s.step * state.dir
          state.stepAt = now + s.interval * 1000
        }
        busy = true
      } else {
        state.stepAt = 0
      }

      if (now < state.holdUntil) busy = true

      const ease = 1 - Math.exp(-dt / 0.35)
      const aimYaw = state.pointer.inside ? state.pointer.x * s.parallax * 9 : 0
      const aimPitch = state.pointer.inside
        ? -state.pointer.y * s.parallax * 6
        : 0
      state.yaw += (aimYaw - state.yaw) * ease
      state.pitch += (aimPitch - state.pitch) * ease
      if (
        Math.abs(aimYaw - state.yaw) > 0.01 ||
        Math.abs(aimPitch - state.pitch) > 0.01
      )
        busy = true

      return busy
    }

    const render = (s: Settings, now: number) => {
      const elapsed = state.intro ? now - state.intro.start : 0
      const swell =
        1 + s.stretch * 0.12 * Math.min(1, Math.abs(state.velocity) / 420)
      let spinOffset = 0
      if (state.intro?.type === "spin") {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1))
        spinOffset = -300 * state.dir * (1 - p)
      } else if (state.intro?.type === "assemble") {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1))
        spinOffset = -32 * state.dir * (1 - p)
      }
      const angle = state.angle + spinOffset
      const R = s.radius * swell

      if (s.axis === "x") {
        camera.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${s.tilt + state.yaw}deg) rotateX(${state.pitch}deg)`
        ring.style.transform = `rotateX(${-angle}deg)`
      } else if (s.layout.inward) {
        camera.style.transform = `translate3d(0, 0, ${s.perspective - 1}px) rotateX(${s.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`
        ring.style.transform = `rotateY(${angle}deg)`
      } else {
        camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${s.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`
        ring.style.transform = `rotateY(${angle}deg)`
      }

      for (let index = 0; index < s.count; index++) {
        const card = cardRefs.current[index]
        if (!card) continue
        const base = index * s.step
        const mod = introCard(elapsed, base)
        const r = R * mod.radius
        let transform: string
        if (s.axis === "x") {
          transform = `rotateX(${-base}deg) translateZ(${r}px)`
        } else if (s.layout.inward) {
          transform = `rotateY(${base}deg) translateZ(${-r}px)`
        } else {
          transform = `rotateY(${base}deg) translateZ(${r}px)`
          if (s.layout.billboard) transform += ` rotateY(${-(base + angle)}deg)`
        }
        if (mod.lift)
          transform +=
            s.axis === "x"
              ? ` translateX(${mod.lift}px)`
              : ` translateY(${mod.lift}px)`
        card.style.transform = transform

        const world = wrap(base + angle)
        const facing = Math.cos(world * TO_RAD)
        if (s.layout.inward)
          card.style.visibility = Math.abs(world) > 86 ? "hidden" : ""
        const fade = s.depthFade * Math.pow((1 - facing) / 2, 1.25)
        card.style.setProperty("--cc-depth", fade.toFixed(3))
      }

      const index =
        ((Math.round(-state.angle / s.step) % s.count) + s.count) % s.count || 0
      if (index !== activeRef.current) {
        activeRef.current = index
        setActive(index)
        onChangeRef.current?.(index)
      }
    }

    const frame = (now: number) => {
      raf = 0
      root.dataset.running = "true"
      const s = settingsRef.current
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60
      state.last = now
      const busy = advance(s, dt, now)
      render(s, now)
      if (busy && visible && !document.hidden)
        raf = requestAnimationFrame(frame)
      else {
        state.last = 0
        root.dataset.running = "false"
      }
    }

    const wake = () => {
      if (!raf && visible && !document.hidden)
        raf = requestAnimationFrame(frame)
    }
    wakeRef.current = wake

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        state.last = 0
        root.dataset.running = "false"
      } else wake()
    }

    const resize = new ResizeObserver(() => {
      measure()
      wake()
    })
    resize.observe(root)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible) wake()
      else {
        cancelAnimationFrame(raf)
        raf = 0
        state.last = 0
        root.dataset.running = "false"
      }
    })
    io.observe(root)

    const onWheel = (event: WheelEvent) => {
      const s = settingsRef.current
      if (!s.draggable) return
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0
      if (!delta) return
      event.preventDefault()
      const perPixel = 180 / (Math.PI * s.radius * state.fit)
      state.target = null
      state.angle -= delta * perPixel * (s.layout.inward ? -1 : 1)
      state.velocity = -delta * perPixel * (s.layout.inward ? -1 : 1) * 30
      state.holdUntil = performance.now() + 1600
      clearTimeout(state.wheelTimer)
      state.wheelTimer = setTimeout(() => {
        if (settingsRef.current.snap)
          state.target = nearest(state.angle + state.velocity * 0.12)
        wake()
      }, 140)
      wake()
    }
    root.addEventListener("wheel", onWheel, { passive: false })
    document.addEventListener("visibilitychange", onVisibility)

    measure()
    render(settingsRef.current, performance.now())
    wake()

    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      io.disconnect()
      clearTimeout(state.wheelTimer)
      root.removeEventListener("wheel", onWheel)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const focusIndex = useCallback((index: number) => {
    const state = stateRef.current
    const s = settingsRef.current
    let target = -index * s.step
    target += 360 * Math.round((state.angle - target) / 360)
    if (s.reduced) {
      state.angle = target
      state.velocity = 0
      state.target = null
    } else state.target = target
    state.holdUntil = performance.now() + 2800
    wakeRef.current()
  }, [])

  const stepBy = useCallback((delta: number) => {
    const state = stateRef.current
    const s = settingsRef.current
    const base = state.target ?? Math.round(state.angle / s.step) * s.step
    const target = base - delta * s.step * (s.layout.inward ? -1 : 1)
    if (s.reduced) {
      state.angle = target
      state.velocity = 0
      state.target = null
    } else state.target = target
    state.holdUntil = performance.now() + 2800
    wakeRef.current()
  }, [])

  useLayoutEffect(() => {
    measureRef.current()
    wakeRef.current()
  }, [
    settings.radius,
    settings.cardW,
    settings.cardH,
    settings.tilt,
    settings.perspective,
    settings.captions,
    settings.count,
  ])
  return {
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
  }
}
