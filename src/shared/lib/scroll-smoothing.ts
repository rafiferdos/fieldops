import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export const smoothScrollMedia =
  "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"

// Create inside a GSAP context: it owns plugin disposal; this cleanup owns DOM observers.
export function createScrollSmoothing(
  wrapper: HTMLElement,
  content: HTMLElement,
  { smooth, hashOffset }: { smooth: number; hashOffset: number }
) {
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
      delete wrapper.dataset.scrollMode
    },
  }
}
