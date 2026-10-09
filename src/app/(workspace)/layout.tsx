import type { ReactNode } from "react"
import { getViewer } from "@/features/auth/session"
import { WorkspaceProvider } from "@/features/workspace/components/workspace-provider"
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell"

export const metadata = { robots: { index: false, follow: false } }

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode
}) {
  const viewer = await getViewer()
  // Pages preserve their intended destination when authentication is required.
  if (!viewer) return <main id="main-content">{children}</main>
  // A changed identity remounts both the query cache and the UI preference store.
  return (
    <WorkspaceProvider key={`${viewer.profile.id}:${viewer.profile.role}`}>
      <WorkspaceShell profile={viewer.profile}>{children}</WorkspaceShell>
    </WorkspaceProvider>
  )
}
