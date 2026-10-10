"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import type { Route } from "next"
import gsap from "gsap"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shared/ui/navigation-menu"
import styles from "./rubber-segment.module.css"

export interface NavigationLink {
  href: Route
  label: string
}
interface RubberSegmentProps {
  items: readonly NavigationLink[]
  pathname: string
  stretch?: number
  squash?: number
  speed?: number
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

// React Bits' edge dilation is adapted to real navigation, without radio/drag-to-route semantics.
export function RubberSegment({
  items,
  pathname,
  stretch = 0.75,
  squash = 2,
  speed = 1,
}: RubberSegmentProps) {
  const scope = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = scope.current
    if (!root) return
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("a"))
    const thumb = root.querySelector<HTMLElement>("[data-rubber-thumb]")
    if (!thumb) return
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const edges = { left: 0, right: 0 }
    let animation: gsap.core.Timeline | undefined
    let active = links.findIndex((link) =>
      isActive(pathname, link.getAttribute("href") ?? "")
    )
    let current = active
    let alive = true
    const paint = () => {
      const width = root.clientWidth - 6
      thumb.style.clipPath = `inset(0 ${Math.max(0, width - edges.right)}px 0 ${Math.max(0, edges.left)}px round 7px)`
    }
    const travel = (index: number, instant = false) => {
      animation?.kill()
      current = index
      const link = links[index]
      thumb.hidden = !link
      if (!link) return
      // Menu items have their own offset parents; measure all slots in track coordinates.
      const box = link.getBoundingClientRect()
      const left = box.left - root.getBoundingClientRect().left - 3,
        right = left + box.width
      if (instant || media.matches || edges.right === 0) {
        edges.left = left
        edges.right = right
        paint()
        return
      }
      const direction = left > edges.left ? 1 : -1
      animation = gsap
        .timeline({ onUpdate: paint })
        .to(edges, {
          left: left + (Math.min(edges.left, left) - left) * stretch,
          right: right + (Math.max(edges.right, right) - right) * stretch,
          duration: 0.19 / speed,
          ease: "power3.out",
        })
        .to(
          edges,
          {
            left: left + direction * squash,
            right,
            duration: 0.3 / speed,
            ease: "power3.out",
          },
          0.15 / speed
        )
        .to(edges, { left, duration: 0.16 / speed, ease: "power2.out" })
    }
    const move = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLAnchorElement)) return
      travel(links.indexOf(event.currentTarget))
    }
    const focusedIndex = () =>
      links.findIndex((link) => link === document.activeElement)
    // Pointer leave and hydration must not erase the keyboard user's focused segment.
    const reset = () => {
      const focus = focusedIndex()
      travel(focus >= 0 ? focus : active)
    }
    const focusOut = (event: FocusEvent) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !root.contains(event.relatedTarget)
      )
        reset()
    }
    const resize = new ResizeObserver(() => travel(current, true))
    resize.observe(root)
    links.forEach((link) => {
      link.addEventListener("pointerenter", move)
      link.addEventListener("focus", move)
    })
    root.addEventListener("pointerleave", reset)
    root.addEventListener("focusout", focusOut)
    media.addEventListener("change", reset)
    const focus = focusedIndex()
    travel(focus >= 0 ? focus : active, true)
    void document.fonts.ready.then(() => {
      if (alive) travel(current, true)
    })
    return () => {
      alive = false
      animation?.kill()
      resize.disconnect()
      active = -1
      links.forEach((link) => {
        link.removeEventListener("pointerenter", move)
        link.removeEventListener("focus", move)
      })
      root.removeEventListener("pointerleave", reset)
      root.removeEventListener("focusout", focusOut)
      media.removeEventListener("change", reset)
    }
  }, [items, pathname, stretch, squash, speed])
  return (
    <div
      ref={scope}
      className={`${styles.track} hidden md:block`}
      data-rubber-segment=""
      style={{ "--rs-count": items.length }}
    >
      <NavigationMenu
        aria-label="Main navigation"
        className={styles.navigation}
      >
        <NavigationMenuList className="grid auto-cols-fr grid-flow-col gap-0">
          {items.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                render={<Link href={item.href} />}
                active={isActive(pathname, item.href)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                className={styles.item}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      {/* The source's clipped label copy preserves contrast across the elastic thumb. */}
      <span
        data-rubber-thumb=""
        className={styles.thumb}
        aria-hidden="true"
        hidden
      >
        {items.map((item) => (
          <span key={item.href} className={`${styles.item} ${styles.copy}`}>
            {item.label}
          </span>
        ))}
      </span>
    </div>
  )
}
