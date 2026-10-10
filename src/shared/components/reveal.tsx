"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { observeEntryMotion } from "@/shared/lib/entry-motion"

// Server-rendered content remains readable without scripts or motion support.
export function Reveal({
  children,
  className,
  stagger = false,
  as: Element = "div",
}: {
  children: ReactNode
  className?: string | undefined
  stagger?: boolean
  as?: "div" | "ul" | "ol"
}) {
  const scope = useRef<HTMLElement>(null)
  useEffect(() => {
    if (scope.current)
      return observeEntryMotion(scope.current, stagger ? "group" : "self")
  }, [stagger, Element])
  return (
    <Element
      ref={(node: HTMLElement | null) => {
        scope.current = node
      }}
      className={cn(className)}
      data-reveal=""
    >
      {children}
    </Element>
  )
}
