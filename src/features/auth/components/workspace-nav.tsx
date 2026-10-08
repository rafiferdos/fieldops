"use client"

import { ButtonLink } from "@/shared/components/button-link"

import { useState } from "react"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import {
  Menu,
  Wrench,
  ClipboardList,
  CalendarDays,
  Plus,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from "lucide-react"
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
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const links: { href: Route; label: string; icon: LucideIcon }[] = [
    {
      href: roleHome(role),
      icon:
        role === "ADMIN"
          ? LayoutDashboard
          : role === "TECHNICIAN"
            ? CalendarDays
            : ClipboardList,
      label:
        role === "CUSTOMER"
          ? "My requests"
          : role === "TECHNICIAN"
            ? "Assigned visits"
            : "Overview",
    },
    ...(role === "CUSTOMER"
      ? [
          {
            href: "/customer/requests/new" as const,
            label: "New request",
            icon: Plus,
          },
          {
            href: "/customer/work-orders" as const,
            label: "Work orders",
            icon: CalendarDays,
          },
        ]
      : []),
    ...(role === "ADMIN"
      ? [
          {
            href: "/admin/requests" as const,
            label: "Requests",
            icon: ClipboardList,
          },
          {
            href: "/admin/work-orders" as const,
            label: "Work orders",
            icon: CalendarDays,
          },
          { href: "/admin/services" as const, label: "Services", icon: Wrench },
        ]
      : []),
    { href: "/account" as const, label: "Account", icon: UserRound },
  ]
  const navigation = links.map((link) => (
    <ButtonLink
      key={link.href}
      href={link.href}
      variant="ghost"
      onClick={() => setOpen(false)}
      aria-current={
        pathname === link.href ||
        (link.href !== roleHome(role) && pathname.startsWith(`${link.href}/`))
          ? "page"
          : undefined
      }
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-brand-ink"
    >
      <link.icon aria-hidden="true" className="size-4" />
      {link.label}
    </ButtonLink>
  ))
  return (
    <>
      <nav aria-label="Workspace navigation" className="hidden gap-1 lg:flex">
        {navigation}
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
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
