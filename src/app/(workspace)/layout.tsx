import type { ReactNode } from "react"
import { getViewerAvailability } from "@/features/auth/session"
import { SessionUnavailable } from "@/features/auth/components/session-unavailable"
import { WorkspaceProvider } from "@/features/workspace/components/workspace-provider"
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell"

export const metadata = { robots: { index: false, follow: false } }

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode
}) {
  const availability = await getViewerAvailability()
  if (!availability.available) return <SessionUnavailable />
  const { viewer } = availability
  // Pages preserve their intended destination when authentication is required.
  if (!viewer) return <main id="main-content">{children}</main>
  // A changed identity remounts both the query cache and the UI preference store.
  return (
    <WorkspaceProvider key={`${viewer.profile.id}:${viewer.profile.role}`}>
      <WorkspaceShell profile={viewer.profile}>{children}</WorkspaceShell>
    </WorkspaceProvider>
  )
}
