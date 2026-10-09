"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

// Server content owns the markup; this boundary adds scoped, disposable choreography.
export function MarketingMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Stable server words preserve kerning, whitespace and glyph overhang throughout entry.
        gsap.from("[data-hero-word]", {
          yPercent: 45,
          rotate: 1.5,
          opacity: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "transform,opacity",
        })
        gsap.from("[data-hero-intro]", {
          y: 18,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
        })
        gsap.from("[data-tool]", {
          rotate: -70,
          scale: 0.75,
          duration: 1.1,
          ease: "back.out(1.7)",
        })
        gsap.from("[data-hero-rule]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "power3.out",
        })
      })
      // matchMedia reverts animation styles on preference changes and unmount.
      return () => media.revert()
    },
    { scope }
  )

  return <div ref={scope}>{children}</div>
}
