"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { createLensMap, LENS_DISPLACEMENT } from "@/shared/lib/lens-map"
import { Card } from "@/shared/ui/card"

interface LensImage {
  url: string
  width: number
  height: number
}

// Controls stay above the filtered backdrop, so only the material bends, never text.
export function LiquidLens({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const scope = useRef<HTMLDivElement>(null)
  const filterId = `lens-${useId().replace(/:/g, "")}`
  const [map, setMap] = useState<LensImage | null>(null)

  useEffect(() => {
    const element = scope.current
    // CSS.supports alone accepts SVG URLs in browsers that do not render this path.
    const chromium = /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent)
    if (!element || !chromium || !("ResizeObserver" in window)) return
    const preference = window.matchMedia(
      "(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)"
    )
    let frame = 0
    let previousSize = ""
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (preference.matches) {
          previousSize = ""
          setMap(null)
          return
        }
        const width = Math.round(element.offsetWidth)
        const height = Math.round(element.offsetHeight)
        if (width < 1 || height < 1 || width > 960 || height > 160) return
        const size = `${width}:${height}`
        if (size === previousSize) return
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext("2d")
        if (!context) return
        const data = context.createImageData(width, height)
        data.data.set(createLensMap(width, height))
        context.putImageData(data, 0, 0)
        previousSize = size
        setMap({ url: canvas.toDataURL(), width, height })
      })
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    preference.addEventListener("change", update)
    return () => {
      observer.disconnect()
      preference.removeEventListener("change", update)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Card
      ref={scope}
      className={cn(
        "liquid-lens gap-0 overflow-visible rounded-full bg-transparent p-0 shadow-none ring-0",
        className
      )}
      data-optics={map ? "refraction" : "translucent"}
    >
      {map && (
        <svg className="pointer-events-none absolute size-0" aria-hidden="true">
          <defs>
            <filter
              id={filterId}
              colorInterpolationFilters="sRGB"
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="1.25"
                result="soft"
              />
              <feImage
                href={map.url}
                x="0"
                y="0"
                width={map.width}
                height={map.height}
                preserveAspectRatio="none"
                result="lens-map"
              />
              <feDisplacementMap
                in="soft"
                in2="lens-map"
                scale={LENS_DISPLACEMENT * 2}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      <span
        aria-hidden="true"
        className="liquid-lens-material"
        style={map ? { backdropFilter: `url("#${filterId}")` } : undefined}
      />
      <div className="relative">{children}</div>
    </Card>
  )
}
