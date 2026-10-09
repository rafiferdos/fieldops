"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { observeEntryMotion } from "@/shared/lib/entry-motion"

// New route/streamed cards enter once, without animating explicit Reveal groups twice.
export function SurfaceMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useEffect(() => {
    if (scope.current) return observeEntryMotion(scope.current, "surfaces")
  }, [pathname])
  return <div ref={scope}>{children}</div>
}
