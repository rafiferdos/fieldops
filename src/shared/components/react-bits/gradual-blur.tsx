"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import "./gradual-blur.css"

// The original overlapping masks progressively blur the public viewport edge.
export function GradualBlur({
  strength = 2,
  height = "6rem",
  divCount = 5,
}: {
  strength?: number
  height?: string
  divCount?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useEffect(() => {
    const edge = ref.current
    if (!edge) return
    let frame = 0
    const measure = () => {
      frame = 0
      edge.toggleAttribute(
        "data-at-end",
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 8
      )
    }
    const update = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    const resize = new ResizeObserver(update)
    resize.observe(document.body)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [pathname])
  const count = Math.max(1, Math.min(8, Math.round(divCount)))
  const increment = 100 / count
  return (
    <div
      ref={ref}
      className="gradual-blur-page"
      style={{ height }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => {
        const i = index + 1,
          p1 = increment * (i - 1),
          p2 = increment * i,
          p3 = increment * (i + 1),
          p4 = increment * (i + 2)
        const gradient = `linear-gradient(to bottom, transparent ${p1}%, black ${p2}%${p3 <= 100 ? `, black ${p3}%` : ""}${p4 <= 100 ? `, transparent ${p4}%` : ""})`
        return (
          <div
            key={i}
            style={{
              maskImage: gradient,
              WebkitMaskImage: gradient,
              backdropFilter: `blur(${0.0625 * (i + 1) * Math.max(0, strength)}rem)`,
              WebkitBackdropFilter: `blur(${0.0625 * (i + 1) * Math.max(0, strength)}rem)`,
            }}
          />
        )
      })}
    </div>
  )
}
