"use client"

import { StatusScreen } from "@/shared/components/status-screen"
import { Button } from "@/shared/ui/button"

// A full reload rechecks the dependency without deleting cookies or retrying a write.
export function SessionUnavailable() {
  return (
    <main id="main-content">
      <title>FieldOps | Session temporarily unavailable</title>
      <StatusScreen
        kind="error"
        title="Your session is temporarily unavailable"
        description="We cannot securely check your session right now. Please reload when the connection is restored."
      >
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </StatusScreen>
    </main>
  )
}
