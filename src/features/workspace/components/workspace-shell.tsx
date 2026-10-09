"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { LifeBuoy, BookOpen, Menu } from "lucide-react"
import { Brand } from "@/shared/components/brand"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Button } from "@/shared/ui/button"
import {
  BranchedMenu,
  type BranchLink,
  type BranchGroup,
} from "@/shared/components/react-bits/branched-menu"
import { Badge } from "@/shared/ui/badge"
import { TooltipProvider } from "@/shared/ui/tooltip"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/shared/ui/sidebar"
import { AccountMenu } from "@/features/auth/components/account-menu"
import type { Profile } from "@/features/auth/schemas"
import { useWorkspaceScroll } from "../hooks/use-workspace-scroll"
import { workspaceLinks, isWorkspaceLinkActive } from "../navigation"
import { useWorkspacePreference } from "./workspace-provider"
import { WorkspaceMotion } from "./workspace-motion"

function WorkspaceSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const { setOpenMobile, setOpen } = useSidebar()
  const links: BranchLink[] = workspaceLinks(profile.role).map((link) => ({
    href: link.href,
    label: link.label,
    icon: <link.icon aria-hidden="true" />,
    active: isWorkspaceLinkActive(pathname, link.href, profile.role),
  }))
  const home = links[0]
  if (!home) throw new Error("Every workspace needs a home route")
  const groups: BranchGroup[] = [
    {
      label: "Operations",
      items: links.filter((link) => link !== home && link.href !== "/account"),
    },
    {
      label: "Account & help",
      items: [
        ...links.filter((link) => link.href === "/account"),
        {
          href: "/services",
          label: "Service catalog",
          icon: <BookOpen aria-hidden="true" />,
          active: false,
        },
        {
          href: "/contact",
          label: "Contact support",
          icon: <LifeBuoy aria-hidden="true" />,
          active: false,
        },
      ],
    },
  ]
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
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <BranchedMenu
            home={home}
            groups={groups}
            pathname={pathname}
            onNavigate={() => setOpenMobile(false)}
          />
        </SidebarGroup>
        {/* The compact rail reopens the full tree instead of duplicating its navigation. */}
        <Button
          variant="ghost"
          size="icon"
          className="mx-auto hidden size-11 group-data-[collapsible=icon]:flex"
          aria-label="Expand workspace navigation"
          onClick={() => setOpen(true)}
        >
          <Menu aria-hidden="true" />
        </Button>
      </SidebarContent>
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
      <SidebarProvider
        open={open}
        onOpenChange={setOpen}
        className="workspace-shell"
      >
        <WorkspaceSidebar profile={profile} />
        <header className="workspace-header z-30 flex h-18 shrink-0 items-center justify-between gap-3 border-b px-5 sm:px-8">
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
        <SidebarInset className="min-w-0 bg-background">
          <WorkspaceMotion>
            <div
              id="main-content"
              className="mx-auto w-full max-w-7xl px-5 pt-26 pb-8 sm:px-8 sm:pt-28 sm:pb-10"
            >
              {children}
            </div>
          </WorkspaceMotion>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
