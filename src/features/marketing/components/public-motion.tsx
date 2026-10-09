"use client"

import { useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SurfaceMotion } from "@/shared/components/surface-motion"
import {
  createScrollSmoothing,
  preserveScrollOnMediaChange,
  smoothScrollMedia,
} from "@/shared/lib/scroll-smoothing"

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Public storytelling adds image depth to the shared native-scroll smoothing policy.
export function PublicMotion({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useGSAP(
    () => {
      const viewport = wrapper.current
      const page = content.current
      if (!viewport || !page) return
      const disposePosition = preserveScrollOnMediaChange(viewport)
      const media = gsap.matchMedia()
      media.add(smoothScrollMedia, () => {
        // Fixed navigation and portalled dialogs stay outside the transformed content.
        const scroll = createScrollSmoothing(viewport, page, {
          smooth: 0.6,
          hashOffset: 112,
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
        return scroll.dispose
      })
      return () => {
        disposePosition()
        media.revert()
      }
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
