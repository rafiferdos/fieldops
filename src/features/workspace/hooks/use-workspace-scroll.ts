"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Nested layouts can retain a previous queue's scroll; new routes start with their heading visible.
export function useWorkspaceScroll() {
  const pathname = usePathname()
  const previous = useRef(pathname)
  const fromHistory = useRef(false)
  useEffect(() => {
    const restore = () => {
      fromHistory.current = window.location.pathname !== previous.current
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])
  useLayoutEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    // Preserve browser Back/Forward restoration and explicit account-setting anchors.
    if (!fromHistory.current && !window.location.hash)
      window.scrollTo({ top: 0, behavior: "instant" })
    fromHistory.current = false
  }, [pathname])
}
