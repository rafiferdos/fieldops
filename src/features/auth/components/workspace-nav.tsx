"use client"
import Link from "next/link"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import type { Role } from "../schemas"
import { roleHome } from "../policy"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import { Button } from "@/shared/ui/button"

export function WorkspaceNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const links: { href: Route; label: string }[] = [
    {
      href: roleHome(role),
      label: role === "CUSTOMER" ? "My requests" : "Workspace",
    },
    ...(role === "CUSTOMER"
      ? [{ href: "/customer/requests/new" as const, label: "New request" }]
      : []),
    { href: "/account" as const, label: "Account" },
  ]
  const navigation = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={pathname === link.href ? "page" : undefined}
      className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
    >
      {link.label}
    </Link>
  ))
  return (
    <>
      <nav aria-label="Workspace navigation" className="hidden gap-1 md:flex">
        {navigation}
      </nav>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open workspace navigation"
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Workspace</SheetTitle>
            <SheetDescription>{role.toLowerCase()} navigation</SheetDescription>
          </SheetHeader>
          <nav
            aria-label="Mobile workspace navigation"
            className="flex flex-col gap-3 p-5"
          >
            {navigation}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
