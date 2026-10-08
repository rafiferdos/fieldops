import Link from "next/link"
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  UserRound,
  Wrench,
} from "lucide-react"
import { requireViewer } from "@/features/auth/session"
import { PageHeading } from "@/shared/components/page-heading"
import { Reveal } from "@/shared/components/reveal"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

export const metadata = { title: "Admin workspace" }
export default async function AdminPage() {
  const { profile } = await requireViewer("ADMIN", "/admin")
  // Navigation cards are entry points, not unimplemented analytics or invented metrics.
  return (
    <>
      <PageHeading
        eyebrow="Administrator workspace"
        title={`Welcome, ${profile.name}`}
        description="Review customer requests, assign qualified technicians and follow confirmed visits."
      />
      <Reveal stagger className="grid gap-5 sm:grid-cols-2">
        {(
          [
            {
              href: "/admin/requests",
              title: "Review requests",
              text: "Review the details and coordinate a qualified, available technician.",
              icon: ClipboardList,
            },
            {
              href: "/admin/work-orders",
              title: "Follow work orders",
              text: "Check confirmed visits, scheduling and documented service progress.",
              icon: CalendarDays,
            },
            {
              href: "/account",
              title: "Manage account",
              text: "Keep your name and service contact information up to date.",
              icon: UserRound,
            },
            {
              href: "/services",
              title: "Browse services",
              text: "Explore the current catalog and published base prices.",
              icon: Wrench,
            },
          ] as const
        ).map(({ href, title, text, icon: Icon }) => (
          <Card
            key={href}
            className="interactive-card relative border shadow-none"
          >
            <CardHeader>
              <div className="mb-4 flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-brand-ink">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              </div>
              <CardTitle className="text-2xl">
                <Link
                  href={href}
                  className="after:absolute after:inset-0 after:rounded-3xl"
                >
                  {title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="leading-relaxed text-muted-foreground">
              {text}
            </CardContent>
          </Card>
        ))}
      </Reveal>
    </>
  )
}
