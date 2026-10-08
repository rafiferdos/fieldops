import Link from "next/link"
import { Button } from "@/shared/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The requested page does not exist.
      </p>
      <Button render={<Link href="/" />} className="self-start">
        Return home
      </Button>
    </main>
  )
}
