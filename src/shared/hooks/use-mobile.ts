"use client"

import { useSyncExternalStore } from "react"

const query = "(max-width: 767px)"
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

// A stable server snapshot avoids mismatched mobile markup during hydration.
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
