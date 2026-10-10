
"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { ButtonLink } from "@/shared/components/button-link"
import { Card } from "@/shared/ui/card"
import { Brand } from "./brand"
import { ThemeToggle } from "./theme-toggle"
import { StaggeredMenu } from "./react-bits/staggered-menu"

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const

export function SiteHeader({
  accountControl,
}: {
  accountControl?: ReactNode
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 72)

    update()
    window.addEventListener("scroll", update, { passive: true })

    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <header
      data-site-header=""
      data-condensed={scrolled ? "" : undefined}
      className={cn(
        "site-header pointer-events-none fixed inset-x-0 top-3 z-40 mx-auto w-[calc(100%-2rem)] max-w-7xl sm:top-5 sm:w-[calc(100%-4rem)] md:transition-[top] md:duration-300",
        scrolled && "md:top-3"
      )}
    >
      <Card
        className={cn(
          "frosted-nav pointer-events-auto mx-auto max-w-[900px] gap-0 overflow-visible rounded-full bg-(--navigation-surface) p-0 ring-0 md:w-full md:transition-[max-width,border-radius,box-shadow] md:duration-300",
          scrolled
            ? "md:max-w-[980px] md:rounded-full md:shadow-lg"
            : "md:max-w-[1100px] md:rounded-[22px] md:shadow-sm"
        )}
      >
        <div
          className={cn(
            "nav-island flex min-h-16 items-center justify-between gap-2 px-2 sm:px-4 md:m-0 md:gap-3 md:px-5 md:transition-[min-height] md:duration-300",
            scrolled ? "md:min-h-[60px]" : "md:min-h-[72px]"
          )}
        >
          <Brand />

          {/* Desktop-only editorial navigation */}
          <nav
            aria-label="Main navigation"
            data-editorial-nav=""
            className="hidden md:flex"
          >
            <ul className="flex items-center gap-0 lg:gap-1">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`)

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative inline-flex min-h-11 items-center rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute bottom-1 left-2.5 right-2.5 h-0.5 origin-center scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                          active && "scale-x-100"
                        )}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />

            {accountControl ?? (
              <ButtonLink
                href="/login"
                variant="secondary"
                className="nav-sign-in bg-foreground text-background hover:bg-foreground/85 md:bg-transparent md:text-foreground md:ring-1 md:ring-border md:hover:bg-muted"
              >
                Sign in
              </ButtonLink>
            )}

            <ButtonLink
              href="/services"
              className="hidden min-h-10 gap-1.5 rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90 lg:inline-flex"
            >
              Explore services
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </ButtonLink>

            {/* Existing mobile navigation, unchanged */}
            <StaggeredMenu items={links} pathname={pathname} />
          </div>
        </div>
      </Card>
    </header>
  )
}
