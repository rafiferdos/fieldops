import Link from "next/link"
import type { ReactNode } from "react"
import { SiteHeader } from "@/shared/components/site-header"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto min-h-[70svh] max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
      >
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-5 px-5 py-8 text-sm text-muted-foreground sm:px-8">
          <p>FieldOps · Service, from request to resolution.</p>
          <nav aria-label="Footer navigation" className="flex gap-5">
            <Link href="/services">Services</Link>
            <Link href="/about">How it works</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
