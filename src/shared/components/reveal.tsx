"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { useAnimate } from "motion/react-mini"
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
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const entered = useRef(false)

  useEffect(() => {
    const element = scope.current
    if (!element || entered.current) return
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (preference.matches || !("IntersectionObserver" in window)) return
    const animations: ReturnType<typeof animate>[] = []
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entered.current) return
        entered.current = true
        observer.disconnect()
        const targets = stagger ? Array.from(element.children) : [element]
        targets.forEach((target, index) => {
          if (!(target instanceof HTMLElement)) return
          animations.push(
            animate(
              target,
              {
                opacity: [0.65, 1],
                transform: ["translateY(18px)", "translateY(0px)"],
              },
              {
                duration: 0.65,
                delay: Math.min(index * 0.07, 0.28),
                ease: [0.22, 1, 0.36, 1],
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
      animations.forEach((animation) => animation.complete())
    }
    observer.observe(element)
    preference.addEventListener("change", stop)
    return () => {
      observer.disconnect()
      preference.removeEventListener("change", stop)
      animations.forEach((animation) => animation.stop())
    }
  }, [animate, scope, stagger])

  return (
    <div ref={scope} className={cn(className)} data-reveal="">
      {children}
    </div>
  )
}
