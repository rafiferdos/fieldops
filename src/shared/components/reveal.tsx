"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

// Server-rendered content stays visible even when scripts or observers are unavailable.
export function Reveal({
  children,
  className,
  stagger = false,
}: {
  children: ReactNode
  className?: string
  stagger?: boolean
}) {
  const scope = useRef<HTMLDivElement>(null)
  const entered = useRef(false)

  useEffect(() => {
    const element = scope.current
    if (!element || entered.current) return
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (preference.matches || !("IntersectionObserver" in window)) return
    const animations: Animation[] = []
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entered.current) return
        entered.current = true
        observer.disconnect()
        const targets = stagger ? Array.from(element.children) : [element]
        targets.forEach((target, index) => {
          if (!(target instanceof HTMLElement)) return
          animations.push(
            target.animate(
              [
                // Text remains readable throughout entry, including on tinted surfaces.
                { transform: "translateY(18px)" },
                { transform: "translateY(0px)" },
              ],
              {
                duration: 650,
                delay: Math.min(index * 70, 280),
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              }
            )
          )
        })
      },
      { threshold: 0.08 }
    )
    const stop = () => {
      if (!preference.matches) return
      observer.disconnect()
      // Complete entry immediately if the preference changes during an animation.
      animations.forEach((animation) => animation.cancel())
    }
    observer.observe(element)
    preference.addEventListener("change", stop)
    return () => {
      observer.disconnect()
      preference.removeEventListener("change", stop)
      animations.forEach((animation) => animation.cancel())
    }
  }, [stagger])

  return (
    <div ref={scope} className={cn(className)} data-reveal="">
      {children}
    </div>
  )
}
