"use client"

import { useEffect, useRef, type ReactNode } from "react"
import "./border-glow.css"

// React Bits' original cone masks and mesh gradients use the existing theme palette.
export function BorderGlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const card = ref.current
    if (!card) return
    const media = matchMedia(
      "(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) and (prefers-contrast:no-preference) and (forced-colors:none)"
    )
    let frame = 0,
      x = 0,
      y = 0
    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      card.style.setProperty("--edge-proximity", "0")
    }
    const paint = () => {
      frame = 0
      const rect = card.getBoundingClientRect(),
        cx = rect.width / 2,
        cy = rect.height / 2
      const dx = x - rect.left - cx,
        dy = y - rect.top - cy
      const edge = Math.min(
        1,
        Math.max(Math.abs(dx) / Math.max(cx, 1), Math.abs(dy) / Math.max(cy, 1))
      )
      card.style.setProperty("--edge-proximity", String(edge * 100))
      card.style.setProperty(
        "--cursor-angle",
        `${((Math.atan2(dy, dx) * 180) / Math.PI + 450) % 360}deg`
      )
    }
    const move = (event: PointerEvent) => {
      if (!media.matches) return
      x = event.clientX
      y = event.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }
    card.addEventListener("pointermove", move, { passive: true })
    card.addEventListener("pointerleave", reset)
    media.addEventListener("change", reset)
    return () => {
      reset()
      card.removeEventListener("pointermove", move)
      card.removeEventListener("pointerleave", reset)
      media.removeEventListener("change", reset)
    }
  }, [])
  return (
    <div
      ref={ref}
      className="border-glow-card"
      data-border-glow=""
      style={{
        "--card-bg": "var(--card)",
        "--glow-color": "var(--primary)",
        "--fill-opacity": 0.5,
        ...Object.fromEntries(
          [60, 50, 40, 30, 20, 10].map((alpha) => [
            `--glow-color-${alpha}`,
            `color-mix(in srgb, var(--primary) ${alpha}%, transparent)`,
          ])
        ),
        "--gradient-one":
          "radial-gradient(at 80% 55%, var(--primary) 0px, transparent 50%)",
        "--gradient-two":
          "radial-gradient(at 69% 34%, var(--info-foreground) 0px, transparent 50%)",
        "--gradient-three":
          "radial-gradient(at 8% 6%, var(--warning-foreground) 0px, transparent 50%)",
        "--gradient-four":
          "radial-gradient(at 41% 38%, var(--primary) 0px, transparent 50%)",
        "--gradient-five":
          "radial-gradient(at 86% 85%, var(--info-foreground) 0px, transparent 50%)",
        "--gradient-six":
          "radial-gradient(at 82% 18%, var(--warning-foreground) 0px, transparent 50%)",
        "--gradient-seven":
          "radial-gradient(at 51% 4%, var(--info-foreground) 0px, transparent 50%)",
        "--gradient-base": "linear-gradient(var(--primary) 0 100%)",
      }}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}
