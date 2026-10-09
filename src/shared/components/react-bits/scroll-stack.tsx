"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import "./scroll-stack.css"

gsap.registerPlugin(useGSAP, ScrollTrigger)

// React Bits' stack projection shares the site's GSAP scroll source instead of adding Lenis.
export function ScrollStack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const media = gsap.matchMedia()
      media.add(
        "(min-width:1024px) and (pointer:fine) and (prefers-reduced-motion:no-preference)",
        () => {
          const anchors = Array.from(
            root.querySelectorAll<HTMLElement>("[data-stack-anchor]")
          )
          const cards = anchors
            .map((anchor) => anchor.firstElementChild)
            .filter((node): node is HTMLElement => node instanceof HTMLElement)
          if (!cards.length) return
          const end = root.querySelector<HTMLElement>("[data-stack-end]")
          if (!end) return
          const originals = cards.map((card) => ({
            transform: card.style.transform,
            origin: card.style.transformOrigin,
          }))
          cards.forEach((card) => {
            card.style.transformOrigin = "top center"
          })
          let positions: number[] = [],
            ending = 0
          const read = (scroll: number) => {
            // Anchors never transform, so refresh cannot accidentally include a previous projection.
            positions = anchors.map(
              (anchor) => anchor.getBoundingClientRect().top + scroll
            )
            ending = end.getBoundingClientRect().top + scroll
          }
          const update = (scroll: number) => {
            cards.forEach((card, index) => {
              const top = positions[index]
              if (top === undefined) return
              const start = top - window.innerHeight * 0.2 - index * 20
              const progress = Math.max(
                0,
                Math.min(
                  1,
                  (scroll - start) / Math.max(1, window.innerHeight * 0.1)
                )
              )
              const pinEnd =
                ending - window.innerHeight * 0.2 - card.offsetHeight
              const y = Math.max(0, Math.min(scroll - start, pinEnd - start))
              const scale = 1 - progress * (0.06 - index * 0.02)
              // Write one bounded projection directly; repeated gsap.set calls would retain tweens.
              card.style.transform = `translate3d(0,${y}px,0) scale(${scale})`
            })
          }
          root.dataset.stacking = ""
          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            onRefresh: (self) => {
              read(self.scroll())
              update(self.scroll())
            },
            onUpdate: (self) => update(self.scroll()),
          })
          read(trigger.scroll())
          update(trigger.scroll())
          return () => {
            trigger.kill()
            delete root.dataset.stacking
            cards.forEach((card, index) => {
              card.style.transform = originals[index]?.transform ?? ""
              card.style.transformOrigin = originals[index]?.origin ?? ""
            })
          }
        }
      )
      return () => media.revert()
    },
    { scope: ref }
  )
  return (
    <div ref={ref} className="scroll-stack" data-motion-managed="">
      {children}
      <div data-stack-end="" className="scroll-stack-end" aria-hidden="true" />
    </div>
  )
}
export function ScrollStackItem({ children }: { children: ReactNode }) {
  return (
    <div data-stack-anchor="" className="scroll-stack-card-wrapper">
      {children}
    </div>
  )
}
