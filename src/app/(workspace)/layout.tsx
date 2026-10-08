import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { getViewer } from "@/features/auth/session"
import { WorkspaceNav } from "@/features/auth/components/workspace-nav"
import { SignOutButton } from "@/features/auth/components/sign-out-button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Brand } from "@/shared/components/brand"
import { Badge } from "@/shared/ui/badge"

export const metadata = { robots: { index: false, follow: false } }

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode
}) {
  const viewer = await getViewer()
  // Each page enforces access and preserves its own intended login destination.
  if (!viewer) return <main id="main-content">{children}</main>
  const { profile } = viewer
  return (
    <div className="min-h-svh bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-2 px-5 py-3 sm:px-8">
          <Brand className="text-lg sm:text-xl" />
          <WorkspaceNav role={profile.role} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b py-5 text-xs text-muted-foreground">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="bg-background font-normal capitalize"
            >
              {profile.role.toLowerCase()} workspace
            </Badge>
            <span className="max-w-64 truncate">{profile.name}</span>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            Service catalog
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <main id="main-content" className="min-h-[75svh] py-10 sm:py-12">
          {children}
        </main>
      </div>
    </div>
  )
}
