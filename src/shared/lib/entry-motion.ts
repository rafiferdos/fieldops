import gsap from "gsap"

type EntryMode = "self" | "group" | "surfaces"

// One entry policy serves explicit compositions and streamed operational surfaces.
export function observeEntryMotion(root: HTMLElement, mode: EntryMode) {
  if (!("IntersectionObserver" in window)) return () => undefined
  const media = gsap.matchMedia()
  media.add(
    "(prefers-reduced-motion: no-preference)",
    (context) => {
      const observed = new WeakSet<Element>()
      const animations = new Set<Animation>()
      const observer = new IntersectionObserver(
        (entries) => {
          let visibleIndex = 0
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            observer.unobserve(entry.target)
            if (mode === "surfaces") {
              // Streamed cards may not be hydrated yet. Compositor effects leave React's attributes intact.
              if (typeof entry.target.animate === "function") {
                const animation = entry.target.animate(
                  [
                    { transform: "translateY(32px) scale(0.99)" },
                    { transform: "none" },
                  ],
                  {
                    duration: 750,
                    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                    composite: "add",
                  }
                )
                animations.add(animation)
                animation.onfinish = () => animations.delete(animation)
              }
              continue
            }
            context.add(() => {
              // Preserve full reading contrast; transforms finish without residual inline styles.
              gsap.from(entry.target, {
                y: 32,
                rotateX: entry.target.hasAttribute("data-entry-depth") ? 4 : 0,
                scale: mode === "self" ? 1 : 0.99,
                duration: 0.75,
                delay:
                  mode === "group" ? Math.min(visibleIndex * 0.065, 0.26) : 0,
                ease: "power3.out",
                clearProps: "transform",
              })
            })
            visibleIndex++
          }
        },
        { threshold: 0, rootMargin: "0px 0px -2% 0px" }
      )
      const scan = () => {
        if (mode !== "surfaces") {
          const targets = mode === "group" ? Array.from(root.children) : [root]
          for (const target of targets) {
            if (observed.has(target)) continue
            observed.add(target)
            observer.observe(target)
          }
          return
        }
        for (const target of root.querySelectorAll<HTMLElement>(
          'section, [data-slot="card"], [data-motion-section]'
        )) {
          if (observed.has(target)) continue
          if (
            target.matches("section") &&
            target.querySelector('[data-slot="card"]')
          )
            continue
          if (target.closest("[data-reveal], [data-motion-managed]")) continue
          // Explicitly animated children and nested cards keep their own composition.
          if (target.querySelector("[data-reveal], [data-motion-managed]"))
            continue
          const parent = target.parentElement?.closest(
            'section, [data-slot="card"], [data-motion-section]'
          )
          if (parent && observed.has(parent)) continue
          observed.add(target)
          observer.observe(target)
        }
      }
      scan()
      const updates = new MutationObserver(scan)
      if (mode !== "self")
        updates.observe(root, { childList: true, subtree: true })
      return () => {
        observer.disconnect()
        updates.disconnect()
        for (const animation of animations) animation.cancel()
      }
    },
    root
  )
  return () => media.revert()
}
