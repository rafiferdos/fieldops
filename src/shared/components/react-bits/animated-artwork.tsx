"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import "./animated-artwork.css"

const CrystalizedBall = dynamic(() => import("./crystalized-ball"), {
  ssr: false,
})
const Strands = dynamic(() => import("./strands"), { ssr: false })
const strandColors = ["#059669", "#6366f1", "#d97706"]

// Lazy GPU scenes release their resources when offscreen or motion is unwanted.
export function AnimatedArtwork({ kind }: { kind: "crystal" | "strands" }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let visible = false
    const motion = matchMedia(
      "(prefers-reduced-motion:no-preference) and (prefers-contrast:no-preference) and (forced-colors:none)"
    )
    const sync = () => setActive(visible && motion.matches && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      sync()
    })
    observer.observe(element)
    motion.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      observer.disconnect()
      motion.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [])
  return (
    <div
      ref={ref}
      className={`animated-artwork animated-artwork--${kind}`}
      aria-hidden="true"
      data-artwork={kind}
    >
      <div className="animated-artwork__fallback" />
      {active &&
        (kind === "crystal" ? (
          <CrystalizedBall
            preset="aurora"
            color="#059669"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            particleCount={3000}
          />
        ) : (
          <Strands colors={strandColors} />
        ))}
    </div>
  )
}
