"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import Link from "next/link"
import type { NavigationLink } from "./rubber-segment"
import styles from "./branched-menu.module.css"

export interface BranchLink extends NavigationLink {
  icon: ReactNode
  active: boolean
}
export interface BranchGroup {
  label: string
  items: BranchLink[]
}

function Branch({
  group,
  open,
  onOpenChange,
  onNavigate,
}: {
  group: BranchGroup
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: () => void
}) {
  const row = 36,
    pad = 6,
    trunk = 14,
    radius = 10,
    end = 32
  const y = (index: number) => pad + index * row + row / 2
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={styles.section}
      data-open={open || undefined}
      data-branch-active={group.items.some((link) => link.active) || undefined}
    >
      <CollapsibleTrigger className={styles.head} data-branch-heading="">
        {group.label}
      </CollapsibleTrigger>
      <CollapsibleContent className={styles.fold} keepMounted>
        <div className={styles.tree}>
          {/* Original rounded SVG branches draw only the URL's active path. */}
          <svg
            className={styles.lines}
            width="40"
            height={pad * 2 + group.items.length * row}
            aria-hidden="true"
          >
            <path
              className={styles.base}
              d={`M ${trunk} 0 V ${y(group.items.length - 1) - radius}`}
            />
            {group.items.map((link, index) => {
              const branch = `M ${trunk} ${y(index) - radius} A ${radius} ${radius} 0 0 0 ${trunk + radius} ${y(index)} H ${end}`
              const reach = `M ${trunk} 0 V ${y(index) - radius} A ${radius} ${radius} 0 0 0 ${trunk + radius} ${y(index)} H ${end}`
              const length =
                y(index) -
                radius +
                (Math.PI * radius) / 2 +
                end -
                trunk -
                radius
              return (
                <g key={link.href}>
                  <path className={styles.base} d={branch} />
                  <path
                    className={styles.reach}
                    d={reach}
                    style={{
                      strokeDasharray: length,
                      strokeDashoffset: link.active ? 0 : length,
                    }}
                  />
                </g>
              )
            })}
          </svg>
          {group.items.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.link}
              data-active={link.active || undefined}
              aria-current={link.active ? "page" : undefined}
              onClick={onNavigate}
            >
              <span className={styles.icon} aria-hidden="true">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Role policy remains with the feature; this presentation receives only authorized links.
export function BranchedMenu({
  home,
  groups,
  pathname,
  onNavigate,
}: {
  home: BranchLink
  groups: BranchGroup[]
  pathname: string
  onNavigate: () => void
}) {
  const nav = useRef<HTMLElement>(null)
  const marker = useRef<HTMLSpanElement>(null)
  const [openGroups, setOpenGroups] = useState(
    () => new Set(groups.map((group) => group.label))
  )

  useLayoutEffect(() => {
    const root = nav.current
    const indicator = marker.current
    if (!root || !indicator) return
    const place = (glide: boolean) => {
      const heading = root.querySelector<HTMLElement>(
        '[data-branch-active="true"][data-open] [data-branch-heading]'
      )
      if (!glide) indicator.style.transition = "none"
      if (heading)
        indicator.style.top = `${heading.getBoundingClientRect().top - root.getBoundingClientRect().top + (heading.offsetHeight - 16) / 2}px`
      indicator.toggleAttribute("data-on", !!heading)
      if (!glide) {
        void indicator.offsetHeight
        indicator.style.removeProperty("transition")
      }
    }
    place(true)
    let first = true
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false
        return
      }
      place(false)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [groups, openGroups, pathname])

  return (
    <nav
      ref={nav}
      aria-label="Workspace navigation"
      className={styles.menu}
      data-branched-menu=""
    >
      {/* Restore the original gliding section marker without changing route authorization. */}
      <span
        ref={marker}
        className={styles.marker}
        data-branch-marker=""
        aria-hidden="true"
      />
      <Link
        href={home.href}
        className={styles.home}
        data-active={home.active || undefined}
        aria-current={home.active ? "page" : undefined}
        onClick={onNavigate}
      >
        {home.icon}
        {home.label}
      </Link>
      {groups.map((group) => (
        <Branch
          // Stable identity lets the original SVG transition run across route changes.
          key={group.label}
          group={group}
          open={openGroups.has(group.label)}
          onOpenChange={(next) =>
            setOpenGroups((previous) => {
              const updated = new Set(previous)
              if (next) updated.add(group.label)
              else updated.delete(group.label)
              return updated
            })
          }
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
