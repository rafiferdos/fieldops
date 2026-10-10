import { Card } from "@/shared/ui/card"
import type { ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Brand } from "@/shared/components/brand"
import { Reveal } from "@/shared/components/reveal"
import { ServiceJourney } from "@/features/marketing/components/service-journey"
import { getViewerAvailability } from "@/features/auth/session"
import { SessionUnavailable } from "@/features/auth/components/session-unavailable"

export const metadata = { robots: { index: false, follow: false } }

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const availability = await getViewerAvailability()
  if (!availability.available) return <SessionUnavailable />
  return (
    <div className="min-h-svh bg-muted/20">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Brand />
        <ThemeToggle />
      </header>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-6 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-10">
        {/* The editorial panel stays server-rendered; only the form needs client state. */}
        <aside className="hidden lg:block" aria-label="About your workspace">
          <Reveal>
            <p className="eyebrow">A clearer day starts here</p>
            <h2 className="mt-5 max-w-lg font-heading text-5xl leading-[1.08] font-medium tracking-[-0.04em]">
              Everything connected.
              <br />
              <span className="text-brand-ink">A little less to carry.</span>
            </h2>
          </Reveal>
          <ServiceJourney />
        </aside>
        <main id="main-content" className="mx-auto w-full max-w-lg">
          <Reveal>
            <Card className="gap-0 border p-6 shadow-none sm:p-9 [&_h1]:text-4xl">
              <div className="mb-7 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-brand-ink">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </div>
              {children}
            </Card>
          </Reveal>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Your service details, in your own workspace.
          </p>
        </main>
      </div>
    </div>
  )
}
