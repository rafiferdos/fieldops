import Link from "next/link"
import type { ReactNode } from "react"
import { getViewer } from "@/features/auth/session"
import { WorkspaceNav } from "@/features/auth/components/workspace-nav"
import { SignOutButton } from "@/features/auth/components/sign-out-button"
import { ThemeToggle } from "@/shared/components/theme-toggle"

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
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" className="font-heading text-xl font-semibold">
            FieldOps
          </Link>
          <WorkspaceNav role={profile.role} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto min-h-[80svh] max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
      >
        {children}
      </main>
    </>
  )
}
