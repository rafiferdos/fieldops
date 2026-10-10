import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export const smoothScrollMedia =
  "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"

// Keep this observer outside the disposable smooth-mode context, including during native mode.
export function preserveScrollOnMediaChange(wrapper: HTMLElement) {
  const media = window.matchMedia(smoothScrollMedia)
  let smooth = media.matches
  let position = window.scrollY
  let url = window.location.href
  let refreshing = false
  const beginRefresh = () => {
    refreshing = true
  }
  const endRefresh = () => {
    refreshing = false
  }
  const remember = () => {
    // Temporary range resets during GSAP's transition are not a new reading position.
    if (smooth !== media.matches || refreshing) return
    position = window.scrollY
    url = window.location.href
  }
  const restore = () => {
    if (smooth === media.matches) return
    smooth = media.matches
    if (!wrapper.isConnected || window.location.href !== url) return
    const smoother = ScrollSmoother.get()
    // Restore after GSAP's complete media refresh, using the active surface's supported API.
    if (smoother?.wrapper() === wrapper) smoother.scrollTop(position)
    else if (!smooth) window.scrollTo({ top: position, behavior: "instant" })
  }
  window.addEventListener("scroll", remember, { passive: true })
  ScrollTrigger.addEventListener("refreshInit", beginRefresh)
  ScrollTrigger.addEventListener("refresh", endRefresh)
  ScrollTrigger.addEventListener("matchMedia", restore)
  return () => {
    window.removeEventListener("scroll", remember)
    ScrollTrigger.removeEventListener("refreshInit", beginRefresh)
    ScrollTrigger.removeEventListener("refresh", endRefresh)
    ScrollTrigger.removeEventListener("matchMedia", restore)
  }
}

// Create inside a GSAP context: it owns plugin disposal; this cleanup owns DOM observers.
export function createScrollSmoothing(
  wrapper: HTMLElement,
  content: HTMLElement,
  { smooth, hashOffset }: { smooth: number; hashOffset: number }
) {
  const originalOverflow = wrapper.style.overflow
  wrapper.dataset.scrollMode = "smooth"
  const smoother = ScrollSmoother.create({
    wrapper,
    content,
    smooth,
    smoothTouch: false,
    effects: false,
    normalizeScroll: false,
    // Portalled dialogs, menus and stationary navigation own their own focus/scroll behavior.
    onFocusIn: (_instance, event) =>
      event.target instanceof Node && !content.contains(event.target)
        ? false
        : undefined,
  })
  // Unlike hidden, clip cannot acquire a second scroll offset on focus or scrollIntoView.
  // Window scrolling remains authoritative, so pointer targets do not move on focus.
  if (CSS.supports("overflow", "clip")) wrapper.style.overflow = "clip"
  let active = true
  let frame = 0
  let previousSize = ""
  const resize = new ResizeObserver(([entry]) => {
    if (!entry) return
    const size = `${entry.contentRect.width}:${entry.contentRect.height}`
    if (size === previousSize) return
    previousSize = size
    cancelAnimationFrame(frame)
    // Streamed records, charts and sidebar width changes update one native scroll range.
    frame = requestAnimationFrame(() => ScrollTrigger.refresh())
  })
  resize.observe(content)
  void document.fonts.ready.then(() => {
    if (active) ScrollTrigger.refresh()
  })
  const followHash = () => {
    const target = document.querySelector(":target")
    if (target && content.contains(target))
      smoother.scrollTo(target, false, `top ${hashOffset}px`)
  }
  window.addEventListener("hashchange", followHash)
  return {
    smoother,
    dispose: () => {
      active = false
      resize.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener("hashchange", followHash)
      wrapper.style.overflow = originalOverflow
      delete wrapper.dataset.scrollMode
    },
  }
}
