"use client"

import { useState, type ReactNode } from "react"
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
  onNavigate,
}: {
  group: BranchGroup
  onNavigate: () => void
}) {
  const [open, setOpen] = useState(true)
  const row = 36,
    pad = 6,
    trunk = 12,
    radius = 8,
    end = 32
  const y = (index: number) => pad + index * row + row / 2
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={styles.section}
      data-open={open || undefined}
    >
      <CollapsibleTrigger className={styles.head}>
        {group.label}
      </CollapsibleTrigger>
      <CollapsibleContent className={styles.fold}>
        <div className={styles.tree}>
          {/* Original rounded SVG branches draw only the URL's active path. */}
          <svg
            className={styles.lines}
            width="34"
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
              className={`${styles.link} workspace-link`}
              data-active={link.active || undefined}
              aria-current={link.active ? "page" : undefined}
              onClick={onNavigate}
            >
              <span className={styles.icon}>{link.icon}</span>
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
  return (
    <nav
      aria-label="Workspace navigation"
      className={styles.menu}
      data-branched-menu=""
    >
      <Link
        href={home.href}
        className={`${styles.home} workspace-link`}
        data-active={home.active || undefined}
        aria-current={home.active ? "page" : undefined}
        onClick={onNavigate}
      >
        {home.icon}
        {home.label}
      </Link>
      {groups.map((group) => (
        <Branch
          key={`${pathname}:${group.label}`}
          group={group}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
