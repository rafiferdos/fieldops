"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Nested layouts can retain a previous queue's scroll; new routes start with their heading visible.
export function useWorkspaceScroll() {
  const pathname = usePathname()
  const previous = useRef(pathname)
  const fromHistory = useRef(false)
  const positions = useRef(new Map<string, number>())
  useEffect(() => {
    const restore = () => {
      fromHistory.current = window.location.pathname !== previous.current
    }
    const remember = () => {
      // Ignore the router's reset after the URL has already left the rendered route.
      if (window.location.pathname === previous.current)
        positions.current.set(previous.current, window.scrollY)
    }
    remember()
    window.addEventListener("popstate", restore)
    window.addEventListener("scroll", remember, { passive: true })
    return () => {
      window.removeEventListener("popstate", restore)
      window.removeEventListener("scroll", remember)
    }
  }, [])
  useLayoutEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    const historical = fromHistory.current
    fromHistory.current = false
    // Positions stay in this account's workspace memory; Next.js history internals stay untouched.
    const top = historical ? (positions.current.get(pathname) ?? 0) : 0
    if (window.location.hash) return
    const move = () => {
      const smoother = ScrollSmoother.get()
      if (smoother?.wrapper().hasAttribute("data-workspace-scroll")) {
        ScrollTrigger.refresh()
        smoother.scrollTop(top)
      } else window.scrollTo({ top, behavior: "instant" })
    }
    if (!historical) {
      move()
      return
    }
    // Restore after the new route's DOM and responsive chart layout have committed.
    const frame = requestAnimationFrame(move)
    return () => cancelAnimationFrame(frame)
  }, [pathname])
}
