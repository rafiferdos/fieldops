"use client"

import { useEffect, useRef } from "react"

// Inspired by React Bits Waves; bounded harmonic strands replace its dense noise grid.
export function CoordinationWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const surface = canvas?.parentElement
    const context = canvas?.getContext("2d")
    if (!canvas || !surface || !context) return
    const media = window.matchMedia(
      "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (prefers-contrast: no-preference) and (forced-colors: none)"
    )
    const transparency = window.matchMedia(
      "(prefers-reduced-transparency: reduce)"
    )
    const colors = getComputedStyle(surface)
    const palette = [
      "--chart-2",
      "--info-foreground",
      "--warning-foreground",
    ].map((token) => colors.getPropertyValue(token).trim())
    let width = 0
    let height = 0
    let frame = 0
    let lastPaint = 0
    let time = 0
    let visible = false
    let pointer: { x: number; y: number } | undefined

    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = 1.1
      // Fixed line/point budgets keep complexity independent of viewport area.
      for (let strand = 0; strand < 12; strand++) {
        context.strokeStyle = palette[strand % palette.length] ?? "#34d399"
        context.globalAlpha = 0.22 + (strand % 3) * 0.05
        context.beginPath()
        for (let step = 0; step <= 64; step++) {
          const progress = step / 64
          const x = progress * width
          const base = height * (0.43 + strand * 0.022)
          const wave =
            Math.sin(progress * Math.PI * 2 + time + strand * 0.19) *
              height *
              0.16 +
            Math.sin(progress * Math.PI * 3 - time * 0.65) * height * 0.045
          const distance = pointer ? (x - pointer.x) / 180 : 0
          const pull = pointer
            ? Math.exp(-(distance * distance)) *
              Math.max(-28, Math.min(28, (pointer.y - base) * 0.12))
            : 0
          const y = base + wave + pull
          if (step === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.stroke()
      }
      context.globalAlpha = 1
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      lastPaint = 0
    }
    const tick = (now: number) => {
      // Cap drawing at 30fps; elapsed time keeps motion consistent on faster displays.
      if (now - lastPaint >= 1000 / 30) {
        time += lastPaint ? Math.min((now - lastPaint) / 1000, 0.1) * 0.32 : 0
        lastPaint = now
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      stop()
      pointer = undefined
      if (
        visible &&
        media.matches &&
        !transparency.matches &&
        document.visibilityState === "visible"
      )
        frame = requestAnimationFrame(tick)
      else draw()
    }
    const resize = () => {
      width = surface.clientWidth
      height = surface.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    }
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch") return
      const bounds = surface.getBoundingClientRect()
      pointer = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }
    }
    const leave = () => {
      pointer = undefined
    }
    const size = new ResizeObserver(resize)
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false
        sync()
      },
      { threshold: 0.05 }
    )
    resize()
    size.observe(surface)
    visibility.observe(surface)
    surface.addEventListener("pointermove", move, { passive: true })
    surface.addEventListener("pointerleave", leave)
    media.addEventListener("change", sync)
    transparency.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      stop()
      size.disconnect()
      visibility.disconnect()
      surface.removeEventListener("pointermove", move)
      surface.removeEventListener("pointerleave", leave)
      media.removeEventListener("change", sync)
      transparency.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [])

  // The server CSS fallback remains visible when canvas or scripts are unavailable.
  return (
    <canvas ref={canvasRef} className="coordination-waves" aria-hidden="true" />
  )
}
