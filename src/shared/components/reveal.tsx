"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { observeEntryMotion } from "@/shared/lib/entry-motion"

// Server-rendered content remains readable without scripts or motion support.
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
  useEffect(() => {
    if (scope.current)
      return observeEntryMotion(scope.current, stagger ? "group" : "self")
  }, [stagger])
  return (
    <div ref={scope} className={cn(className)} data-reveal="">
      {children}
    </div>
  )
}
