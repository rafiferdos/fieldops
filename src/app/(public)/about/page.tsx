import { publicMetadata } from "@/infrastructure/seo/metadata"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  FileCheck2,
} from "lucide-react"
import { StrokeText } from "@/shared/components/react-bits/stroke-text"
import { PageHeading } from "@/shared/components/page-heading"
import { Reveal } from "@/shared/components/reveal"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { buttonVariants } from "@/shared/ui/button"

export const metadata = publicMetadata(
  "How it works",
  "See how customers, administrators and technicians coordinate a service visit from request to resolution.",
  "/about"
)
export default function AboutPage() {
  return (
    <>
      <PageHeading
        eyebrow="How FieldOps works"
        title="One service journey. Three clear roles."
        description="Customers request a service, administrators coordinate the visit, and technicians record the work."
      />
      <Reveal stagger className="grid gap-5 md:grid-cols-3">
        {[
          {
            number: "01",
            icon: ClipboardList,
            title: "Request",
            text: "Choose an active service, describe the issue and suggest a visit time. You can edit a pending request or cancel eligible work before the technician starts travelling.",
          },
          {
            number: "02",
            icon: CalendarCheck2,
            title: "Coordinate",
            text: "An administrator reviews the request and finds a qualified, available technician. Your preferred time is a request; the assigned schedule confirms the visit.",
          },
          {
            number: "03",
            icon: FileCheck2,
            title: "Resolve",
            text: "The assigned technician records progress and completion. The final report and an immutable invoice stay connected to your work order.",
          },
        ].map(({ number, icon: Icon, title, text }) => (
          <Card key={number} className="border shadow-none">
            <CardHeader>
              <div className="mb-8 flex items-center justify-between">
                <span className="font-heading text-4xl text-muted-foreground">
                  {number}
                </span>
                <Icon aria-hidden="true" className="size-6 text-brand-ink" />
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="leading-relaxed text-muted-foreground">
              {text}
            </CardContent>
          </Card>
        ))}
      </Reveal>
      <Reveal className="mt-14 grid gap-8 rounded-3xl border bg-primary/5 p-6 sm:p-10 md:grid-cols-2">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight">
            <StrokeText
              text="A preference becomes"
              trigger="scroll"
              fontWeight={500}
              fontSize={72}
              letterSpacing={-2}
            />
            <br />a confirmed plan.
          </h2>
        </div>
        <div className="space-y-6">
          <p className="leading-relaxed text-muted-foreground">
            Your preferred time helps the administrator plan the visit. The
            assigned work order confirms who is coming and when. The service
            price is recorded at assignment, and completion creates the invoice.
          </p>
          <Link href="/faq" className="text-link">
            A few more answers
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Reveal>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t pt-8">
        <p className="text-muted-foreground">
          Ready to make your first request?
        </p>
        <Link href="/services" className={buttonVariants({ size: "lg" })}>
          Explore services
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}
