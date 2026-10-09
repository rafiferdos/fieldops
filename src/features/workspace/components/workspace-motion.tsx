"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import {
  createScrollSmoothing,
  smoothScrollMedia,
} from "@/shared/lib/scroll-smoothing"
import { SurfaceMotion } from "@/shared/components/surface-motion"

gsap.registerPlugin(useGSAP)

// One scroller survives nested workspace routes; fixed chrome and shadcn portals stay outside.
export function WorkspaceMotion({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const viewport = wrapper.current
      const page = content.current
      if (!viewport || !page) return
      const media = gsap.matchMedia()
      media.add(smoothScrollMedia, () => {
        const scroll = createScrollSmoothing(viewport, page, {
          smooth: 0.5,
          hashOffset: 104,
        })
        return scroll.dispose
      })
      return () => media.revert()
    },
    { scope: wrapper }
  )
  return (
    <div ref={wrapper} data-workspace-scroll="">
      <div ref={content} className="workspace-scroll-content">
        <SurfaceMotion>{children}</SurfaceMotion>
      </div>
    </div>
  )
}
