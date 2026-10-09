"use client"

import { useEffect, useRef, type ComponentProps } from "react"
import { cn } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

// React Bits-inspired spotlight, composed with shadcn; attribution lives in THIRD_PARTY_NOTICES.md.
export function SpotlightCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const surface = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = surface.current
    if (!node) return
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (prefers-contrast: no-preference) and (forced-colors: none)"
    )
    let dispose: (() => void) | undefined

    const sync = () => {
      dispose?.()
      dispose = undefined
      if (!media.matches) return
      let frame = 0
      let point = { x: 0, y: 0 }
      const reset = () => {
        cancelAnimationFrame(frame)
        frame = 0
        node.removeAttribute("data-spotlight-active")
        node.style.removeProperty("--spotlight-x")
        node.style.removeProperty("--spotlight-y")
      }
      const move = (event: PointerEvent) => {
        if (event.pointerType === "touch") return
        point = { x: event.clientX, y: event.clientY }
        if (frame) return
        // Coalesce pointer events into one paint; no React renders or idle animation loop.
        frame = requestAnimationFrame(() => {
          frame = 0
          const bounds = node.getBoundingClientRect()
          node.style.setProperty("--spotlight-x", `${point.x - bounds.left}px`)
          node.style.setProperty("--spotlight-y", `${point.y - bounds.top}px`)
          node.setAttribute("data-spotlight-active", "")
        })
      }
      node.addEventListener("pointermove", move, { passive: true })
      node.addEventListener("pointerleave", reset)
      node.addEventListener("pointercancel", reset)
      dispose = () => {
        node.removeEventListener("pointermove", move)
        node.removeEventListener("pointerleave", reset)
        node.removeEventListener("pointercancel", reset)
        reset()
      }
    }
    sync()
    media.addEventListener("change", sync)
    return () => {
      media.removeEventListener("change", sync)
      dispose?.()
    }
  }, [])

  return (
    <Card
      {...props}
      ref={surface}
      className={cn("spotlight-card", className)}
      data-spotlight=""
    />
  )
}
