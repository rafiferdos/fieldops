"use client"

import { Button } from "@/shared/ui/button"

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        We could not display this page. Please try again.
      </p>
      <Button onClick={retry} className="self-start">
        Try again
      </Button>
    </main>
  )
}
