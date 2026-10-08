"use client"

import { ButtonLink } from "@/shared/components/button-link"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Menu } from "lucide-react"
import { Button } from "@/shared/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import { Brand } from "./brand"
import { ThemeToggle } from "./theme-toggle"
import { LiquidLens } from "./liquid-lens"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shared/ui/navigation-menu"

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "How it works" },
  { href: "/faq", label: "FAQ" },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  return (
    <header className="pointer-events-none sticky top-3 z-40 mx-auto mt-3 w-[calc(100%-2rem)] max-w-7xl sm:top-5 sm:mt-5 sm:w-[calc(100%-4rem)]">
      <LiquidLens className="pointer-events-auto mx-auto max-w-[900px]">
        <div className="nav-island flex min-h-16 items-center justify-between gap-2 px-3 sm:px-4">
          <Brand />
          <NavigationMenu
            aria-label="Main navigation"
            className="hidden items-center gap-1 md:flex"
          >
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    render={<Link href={link.href} />}
                    active={pathname === link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="nav-link group/nav"
                  >
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="nav-link-arrow"
                    />
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink
              href="/login"
              variant="secondary"
              className="nav-sign-in group/nav bg-foreground text-background hover:bg-foreground/85"
            >
              Sign in
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5"
              />
            </ButtonLink>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>FieldOps</SheetTitle>
                  <SheetDescription>
                    Find a service or manage your account.
                  </SheetDescription>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-6 p-6"
                >
                  {links.map((link) => (
                    <ButtonLink
                      key={link.href}
                      variant="ghost"
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="justify-between"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden="true" />
                    </ButtonLink>
                  ))}
                  <ButtonLink href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </ButtonLink>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </LiquidLens>
    </header>
  )
}
