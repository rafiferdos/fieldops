"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

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
      media.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          // Native scrolling drives only transforms; there is no pin or scroll hijack.
          gsap.fromTo(
            "[data-scene-image]",
            { scale: 1.04, yPercent: 3 },
            {
              scale: 1.16,
              yPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-service-scene]",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          )
          gsap.fromTo(
            "[data-scene-card]",
            { rotateY: -12, rotateX: 8, y: 32 },
            {
              rotateY: 5,
              rotateX: -3,
              y: -24,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-service-scene]",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          )
          gsap.utils
            .toArray<HTMLElement>("[data-process-step]")
            .forEach((step) => {
              gsap.from(step, {
                // Reading contrast stays constant while perspective and translation add depth.
                y: 48,
                rotateX: 5,
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: { trigger: step, start: "top 90%", once: true },
              })
            })
        }
      )
      // matchMedia reverts animation styles on preference changes and unmount.
      return () => media.revert()
    },
    { scope }
  )

  return <div ref={scope}>{children}</div>
}
