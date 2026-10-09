"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

// ScrollFloat-inspired word depth keeps real spaces, readable opacity and unclipped glyphs.
export function ScrollWords({ children }: { children: string }) {
  const scope = useRef<HTMLSpanElement>(null)
  useGSAP(
    () => {
      const node = scope.current
      if (!node) return
      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          node.querySelectorAll("[data-scroll-word]"),
          { y: 18, rotateX: -35, scale: 0.97 },
          {
            y: 0,
            rotateX: 0,
            scale: 1,
            stagger: 0.04,
            ease: "power2.out",
            scrollTrigger: {
              trigger: node,
              start: "top 98%",
              end: "top 82%",
              scrub: true,
            },
          }
        )
      })
      return () => media.revert()
    },
    { scope }
  )
  return (
    <span ref={scope} className="scroll-words">
      {children.split(" ").map((word, index) => (
        <span key={`${word}-${index}`}>
          {index > 0 && " "}
          <span className="scroll-word" data-scroll-word="">
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}
