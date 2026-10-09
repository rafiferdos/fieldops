"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { LifeBuoy, BookOpen } from "lucide-react"
import { Brand } from "@/shared/components/brand"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Badge } from "@/shared/ui/badge"
import { TooltipProvider } from "@/shared/ui/tooltip"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/shared/ui/sidebar"
import { SurfaceMotion } from "@/shared/components/surface-motion"
import { AccountMenu } from "@/features/auth/components/account-menu"
import type { Profile } from "@/features/auth/schemas"
import { useWorkspaceScroll } from "../hooks/use-workspace-scroll"
import { workspaceLinks, isWorkspaceLinkActive } from "../navigation"
import { useWorkspacePreference } from "./workspace-provider"

function WorkspaceSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <Brand />
          <p className="mt-2 text-xs text-muted-foreground capitalize">
            {profile.role.toLowerCase()} workspace
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Workspace navigation">
              <SidebarMenu>
                {workspaceLinks(profile.role).map((link) => {
                  const active = isWorkspaceLinkActive(
                    pathname,
                    link.href,
                    profile.role
                  )
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        render={<Link href={link.href} />}
                        size="lg"
                        tooltip={link.label}
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <link.icon aria-hidden="true" />
                        <span>{link.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/services" />}
              tooltip="Service catalog"
              size="lg"
            >
              <BookOpen aria-hidden="true" />
              <span>Service catalog</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/contact" />}
              tooltip="Contact support"
              size="lg"
            >
              <LifeBuoy aria-hidden="true" />
              <span>Contact support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function WorkspaceShell({
  profile,
  children,
}: {
  profile: Profile
  children: ReactNode
}) {
  useWorkspaceScroll()
  const open = useWorkspacePreference((state) => state.sidebarOpen)
  const setOpen = useWorkspacePreference((state) => state.setSidebarOpen)
  return (
    <TooltipProvider delay={250}>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <WorkspaceSidebar profile={profile} />
        <SidebarInset className="min-w-0 bg-background">
          <header className="workspace-header sticky top-0 z-30 flex h-18 shrink-0 items-center justify-between gap-3 border-b px-5 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger aria-label="Toggle workspace sidebar" />
              <span className="hidden text-sm font-medium sm:block">
                Your workspace
              </span>
              <Badge variant="outline" className="capitalize">
                {profile.role.toLowerCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AccountMenu profile={profile} />
            </div>
          </header>
          <main
            id="main-content"
            className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10"
          >
            <SurfaceMotion>{children}</SurfaceMotion>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
