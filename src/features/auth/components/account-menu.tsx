"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { LayoutDashboard, UserRound, Settings2, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu"
import type { Profile } from "../schemas"
import { roleHome } from "../policy"
import { SignOutDialog } from "./sign-out-button"

export function AccountMenu({ profile }: { profile: Profile }) {
  const [signingOut, setSigningOut] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={trigger}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Open account menu"
            />
          }
        >
          {/* The contract has no profile photo; use real initials rather than a fabricated portrait. */}
          <Avatar size="lg">
            <AvatarFallback className="bg-primary/15 font-medium text-brand-ink">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="space-y-1 p-3">
              <span className="block truncate text-sm font-medium text-foreground">
                {profile.name}
              </span>
              <span className="block truncate">{profile.email}</span>
              <span className="block capitalize">
                {profile.role.toLowerCase()} workspace
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link href={roleHome(profile.role)} />}
              className="min-h-11"
            >
              <LayoutDashboard aria-hidden="true" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/account" />}
              className="min-h-11"
            >
              <UserRound aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/account#account-settings" />}
              className="min-h-11"
            >
              <Settings2 aria-hidden="true" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSigningOut(true)}
              className="min-h-11"
            >
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SignOutDialog
        open={signingOut}
        onOpenChange={setSigningOut}
        returnFocus={trigger}
      />
    </>
  )
}
