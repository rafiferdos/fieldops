"use client"

import { ButtonLink } from "@/shared/components/button-link"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
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
import { Card } from "@/shared/ui/card"
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
  { href: "/contact", label: "Contact" },
] as const

export function SiteHeader({ accountControl }: { accountControl?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 mx-auto w-[calc(100%-2rem)] max-w-7xl sm:top-5 sm:w-[calc(100%-4rem)]">
      {/* One CSS backdrop surface provides frost without filtering foreground controls. */}
      <Card className="frosted-nav pointer-events-auto mx-auto max-w-[900px] gap-0 overflow-visible rounded-full bg-(--navigation-surface) p-0 ring-0">
        <div className="nav-island flex min-h-16 items-center justify-between gap-2 px-2 sm:px-4">
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
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
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
                    </ButtonLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Card>
    </header>
  )
}
