"use client"

import { Button } from "@/shared/ui/button"
import "./globals.css"

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>FieldOps | Unexpected error</title>
        <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-4 px-6 py-12">
          <h1 className="text-3xl font-semibold">
            FieldOps is temporarily unavailable
          </h1>
          <p className="text-muted-foreground">
            Please try loading the application again.
          </p>
          <Button onClick={retry} className="self-start">
            Try again
          </Button>
        </main>
      </body>
    </html>
  )
}
