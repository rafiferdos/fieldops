"use client"

import { ButtonLink } from "@/shared/components/button-link"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Brand } from "./brand"
import { ThemeToggle } from "./theme-toggle"
import { Card } from "@/shared/ui/card"
import { RubberSegment } from "./react-bits/rubber-segment"
import { StaggeredMenu } from "./react-bits/staggered-menu"

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const

export function SiteHeader({ accountControl }: { accountControl?: ReactNode }) {
  const pathname = usePathname()
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 mx-auto w-[calc(100%-2rem)] max-w-7xl sm:top-5 sm:w-[calc(100%-4rem)]">
      {/* One CSS backdrop surface provides frost without filtering foreground controls. */}
      <Card className="frosted-nav pointer-events-auto mx-auto max-w-[900px] gap-0 overflow-visible rounded-full bg-(--navigation-surface) p-0 ring-0">
        <div className="nav-island flex min-h-16 items-center justify-between gap-2 px-2 sm:px-4">
          <Brand />
          <RubberSegment items={links} pathname={pathname} />
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {accountControl ?? (
              <ButtonLink
                href="/login"
                variant="secondary"
                className="nav-sign-in bg-foreground text-background hover:bg-foreground/85"
              >
                Sign in
              </ButtonLink>
            )}
            <StaggeredMenu items={links} pathname={pathname} />
          </div>
        </div>
      </Card>
    </header>
  )
}
