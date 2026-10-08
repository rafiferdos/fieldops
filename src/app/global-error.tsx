"use client"

import { Button } from "@/shared/ui/button"
import { StatusScreen } from "@/shared/components/status-screen"
import "./globals.css"

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>FieldOps | Unexpected error</title>
        <main id="main-content">
          <StatusScreen
            kind="error"
            title="FieldOps is temporarily unavailable"
            description="Please try loading the application again."
          >
            <Button onClick={retry}>Try again</Button>
          </StatusScreen>
        </main>
      </body>
    </html>
  )
}
