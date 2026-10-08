"use client"

import Link from "next/link"
import { useState } from "react"
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

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "How it works" },
  { href: "/faq", label: "FAQ" },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const navigation = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={() => setOpen(false)}
      aria-current={pathname === link.href ? "page" : undefined}
      className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
    >
      {link.label}
    </Link>
  ))
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            href="/login"
          >
            Sign in
          </Link>
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
                {navigation}
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
