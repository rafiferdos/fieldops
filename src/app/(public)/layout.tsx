import Link from "next/link"
import type { ReactNode } from "react"
import { getViewer } from "@/features/auth/session"
import { AccountMenu } from "@/features/auth/components/account-menu"
import { SiteHeader } from "@/shared/components/site-header"
import { Brand } from "@/shared/components/brand"
import { Separator } from "@/shared/ui/separator"

export default async function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  const viewer = await getViewer()
  return (
    <>
      <SiteHeader
        accountControl={
          viewer ? <AccountMenu profile={viewer.profile} /> : undefined
        }
      />
      <main
        id="main-content"
        className="mx-auto min-h-[70svh] max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
      >
        {children}
      </main>
      <footer className="mt-8 border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-wrap justify-between gap-10">
            <div>
              <Brand />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Service, from request to resolution.
                <br />A clearer way to keep things moving.
              </p>
            </div>
            <nav
              aria-label="Footer navigation"
              className="grid content-start gap-4 text-sm"
            >
              {(
                [
                  { href: "/services", title: "Services" },
                  { href: "/about", title: "How it works" },
                  { href: "/faq", title: "FAQ" },
                  { href: "/contact", title: "Contact" },
                ] as const
              ).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-12 text-muted-foreground hover:text-foreground"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
          <Separator className="my-8" />
          <p className="text-xs text-muted-foreground">
            FieldOps · Thoughtfully coordinated. Clearly documented.
          </p>
        </div>
      </footer>
    </>
  )
}
