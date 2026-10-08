"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Wrench } from "lucide-react"
import { Button } from "@/shared/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import { ThemeToggle } from "./theme-toggle"

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "How it works" },
  { href: "/faq", label: "FAQ" },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const navigation = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={pathname === link.href ? "page" : undefined}
      className="text-sm text-muted-foreground hover:text-foreground aria-[current=page]:text-primary"
    >
      {link.label}
    </Link>
  ))
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-semibold"
        >
          <Wrench className="size-5 text-primary" />
          FieldOps<span className="sr-only"> home</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {navigation}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link className="text-sm font-medium" href="/login">
            Sign in
          </Link>
          <Sheet>
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
                {navigation}
                <Link href="/login">Sign in</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
