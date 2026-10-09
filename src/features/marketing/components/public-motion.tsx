"use client"

import { useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { SurfaceMotion } from "@/shared/components/surface-motion"

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother)

// Public storytelling uses native scroll smoothing; workspaces retain native document scrolling.
export function PublicMotion({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useGSAP(
    () => {
      const viewport = wrapper.current
      const page = content.current
      if (!viewport || !page) return
      const media = gsap.matchMedia()
      media.add(
        "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          // Fixed navigation and portalled dialogs stay outside the transformed content.
          const smoother = ScrollSmoother.create({
            wrapper: viewport,
            content: page,
            smooth: 0.6,
            smoothTouch: false,
            effects: false,
            normalizeScroll: false,
          })
          const scene = page.querySelector("[data-service-scene]")
          if (scene) {
            gsap.fromTo(
              scene.querySelector("[data-scene-image]"),
              { scale: 1.04, yPercent: 3 },
              {
                scale: 1.14,
                yPercent: -4,
                ease: "none",
                scrollTrigger: {
                  trigger: scene,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            )
            gsap.fromTo(
              scene.querySelector("[data-scene-card]"),
              { rotateY: -8, rotateX: 5, y: 22 },
              {
                rotateY: 3,
                rotateX: -2,
                y: -18,
                ease: "none",
                scrollTrigger: {
                  trigger: scene,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            )
          }
          let active = true
          let frame = 0
          let previousHeight = 0
          // Streamed catalog content and loaded fonts update the scroll range once per frame.
          const resize = new ResizeObserver(([entry]) => {
            const height = entry?.contentRect.height ?? 0
            if (height === previousHeight) return
            previousHeight = height
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => ScrollTrigger.refresh())
          })
          resize.observe(page)
          void document.fonts.ready.then(() => {
            if (active) ScrollTrigger.refresh()
          })
          const followHash = () => {
            const target = document.querySelector(":target")
            if (target && page.contains(target))
              smoother.scrollTo(target, false, "top 112px")
          }
          window.addEventListener("hashchange", followHash)
          return () => {
            active = false
            resize.disconnect()
            cancelAnimationFrame(frame)
            window.removeEventListener("hashchange", followHash)
            smoother.kill()
          }
        }
      )
      return () => media.revert()
    },
    { scope: wrapper, dependencies: [pathname], revertOnUpdate: true }
  )
  return (
    <div ref={wrapper} data-public-scroll="">
      <div ref={content} className="public-scroll-content">
        <SurfaceMotion>{children}</SurfaceMotion>
      </div>
    </div>
  )
}
