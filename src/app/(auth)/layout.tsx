import Link from "next/link"
import type { ReactNode } from "react"
import { ThemeToggle } from "@/shared/components/theme-toggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30">
      <header className="mx-auto flex max-w-7xl justify-between px-6 py-6">
        <Link href="/" className="font-heading text-xl font-semibold">
          FieldOps
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="mx-auto max-w-md px-5 py-10">
        {children}
      </main>
    </div>
  )
}
