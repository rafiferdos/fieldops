"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Menu } from "lucide-react"
import { Button } from "@/shared/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import type { NavigationLink } from "./rubber-segment"
import styles from "./staggered-menu.module.css"

gsap.registerPlugin(useGSAP)

function StaggeredPanel({
  items,
  pathname,
  close,
}: {
  items: readonly NavigationLink[]
  pathname: string
  close: () => void
}) {
  const scope = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Keep React Bits' layered entry and label stagger inside the supported modal surface.
        gsap
          .timeline()
          .from("[data-menu-layer]", {
            xPercent: 100,
            duration: 0.5,
            stagger: 0.07,
            ease: "power4.out",
          })
          .from(
            "[data-menu-surface]",
            { xPercent: 100, duration: 0.65, ease: "power4.out" },
            0.15
          )
          .from(
            "[data-menu-label]",
            {
              yPercent: 140,
              rotate: 10,
              duration: 1,
              stagger: 0.1,
              ease: "power4.out",
              clearProps: "transform",
            },
            0.3
          )
      })
      return () => media.revert()
    },
    { scope }
  )
  return (
    <div ref={scope} className={styles.panel}>
      <div className={styles.layers} aria-hidden="true">
        <span data-menu-layer="" />
        <span data-menu-layer="" />
      </div>
      <div data-menu-surface="" className={styles.surface}>
        <SheetTitle className="sr-only">Main navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Explore FieldOps services, workflow and support.
        </SheetDescription>
        <nav aria-label="Mobile navigation">
          <ul className={styles.list}>
            {items.map((item, index) => (
              <li key={item.href} className={styles.itemWrap}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={close}
                  className={styles.item}
                >
                  <span data-menu-label="">{item.label}</span>
                  <span aria-hidden="true" className={styles.number}>
                    0{index + 1}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

// shadcn Sheet retains trapping, Escape, scroll lock and return focus; GSAP owns visual entry.
export function StaggeredMenu({
  items,
  pathname,
}: {
  items: readonly NavigationLink[]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)")
    const resize = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener("change", resize)
    return () => desktop.removeEventListener("change", resize)
  }, [])
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11 md:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent className={styles.sheet}>
        <StaggeredPanel
          items={items}
          pathname={pathname}
          close={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
