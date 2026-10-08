import Link from "next/link"
import { Suspense } from "react"
import { PageSkeleton } from "@/shared/components/page-skeleton"
import { FeaturedServices } from "@/features/marketing/components/featured-services"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  Wrench,
} from "lucide-react"
import { ServiceJourney } from "@/features/marketing/components/service-journey"
import { Reveal } from "@/shared/components/reveal"
import { buttonVariants } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <div className="space-y-24 sm:space-y-32">
      <section className="grid items-center gap-10 pt-2 pb-4 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Service, with a clear next step
          </p>
          <h1 className="mt-7 max-w-3xl font-heading text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.98] font-medium tracking-[-0.06em]">
            Less chasing.
            <br />
            More <span className="text-brand-ink">handled.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            A simpler way to get things fixed. Find the right service, plan a
            visit, and follow every step to completion.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/services"
              className={buttonVariants({
                size: "lg",
                className: "h-12 gap-3 px-6",
              })}
            >
              Explore services
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-12 px-6",
              })}
            >
              See how it works
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 text-brand-ink"
              />
              Qualified assignment
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck2
                aria-hidden="true"
                className="size-4 text-brand-ink"
              />
              Documented work
            </span>
          </div>
        </Reveal>
        <ServiceJourney />
      </section>

      <Reveal>
        <section
          aria-label="A connected service process"
          className="grid gap-6 border-y py-7 sm:grid-cols-3 sm:gap-10"
        >
          {[
            {
              icon: ClipboardList,
              title: "Clear from the start",
              text: "Your needs and visit details, together.",
            },
            {
              icon: CalendarCheck2,
              title: "Thoughtfully coordinated",
              text: "Reviewed, qualified and scheduled.",
            },
            {
              icon: FileCheck2,
              title: "Visible to the finish",
              text: "Track progress and read the final report.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-brand-ink"
              />
              <div>
                <h2 className="text-sm font-medium">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </section>
      </Reveal>

      <section aria-labelledby="services-title">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">The service catalog</p>
            <h2
              id="services-title"
              className="mt-4 font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl"
            >
              The right help.
              <br />A better starting point.
            </h2>
          </div>
          <Link href="/services" className="text-link">
            View all services
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </Reveal>
        <Suspense fallback={<PageSkeleton />}>
          <FeaturedServices />
        </Suspense>
      </section>

      <section
        aria-labelledby="process-title"
        className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
      >
        <div className="self-start lg:sticky lg:top-28">
          <p className="eyebrow">From request to resolution</p>
          <h2
            id="process-title"
            className="mt-4 font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl"
          >
            A little structure.
            <br />A lot less guesswork.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Every visit has a next step. FieldOps keeps the details connected,
            so you can spend less time following up.
          </p>
          <Link href="/about" className="text-link mt-7">
            Get to know the process
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <Reveal stagger className="space-y-4">
          {[
            {
              number: "01",
              title: "Start with what you need.",
              text: "Choose a service, describe the issue and share your preferred time. The guided request keeps the important details together.",
              icon: ClipboardList,
            },
            {
              number: "02",
              title: "Leave room for a real plan.",
              text: "An administrator reviews your request and assigns a qualified, available technician. Your work order shows the confirmed schedule.",
              icon: CalendarCheck2,
            },
            {
              number: "03",
              title: "See the work through.",
              text: "Follow the visit as it progresses. When work is completed, the technician's report and your invoice stay with the work order.",
              icon: FileCheck2,
            },
          ].map(({ number, title, text, icon: Icon }) => (
            <Card
              key={number}
              className="border bg-muted/20 shadow-none sm:p-2"
            >
              <CardHeader>
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-heading text-3xl text-muted-foreground/50">
                    {number}
                  </span>
                  <Icon aria-hidden="true" className="size-5 text-brand-ink" />
                </div>
                <CardTitle className="text-2xl tracking-tight">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-lg leading-relaxed text-muted-foreground">
                {text}
              </CardContent>
            </Card>
          ))}
        </Reveal>
      </section>

      <Reveal>
        <section
          aria-labelledby="roles-title"
          className="surface overflow-hidden p-6 sm:p-10 lg:p-12"
        >
          <p className="eyebrow">Connected by design</p>
          <h2
            id="roles-title"
            className="mt-4 max-w-xl font-heading text-3xl font-medium tracking-tight sm:text-4xl"
          >
            Three roles. One shared picture.
          </h2>
          <Separator className="my-8" />
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ClipboardList,
                title: "For customers",
                text: "Request a service, follow your visit and keep the records close.",
              },
              {
                icon: Wrench,
                title: "For technicians",
                text: "Find your assigned visits, record progress and document the result.",
              },
              {
                icon: CalendarCheck2,
                title: "For administrators",
                text: "Review the details, coordinate availability and keep visits moving.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon
                  aria-hidden="true"
                  className="mb-4 size-5 text-brand-ink"
                />
                <h3 className="font-heading text-xl font-medium">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="relative isolate overflow-hidden rounded-3xl border bg-primary/5 px-6 py-14 text-center sm:py-20">
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full border border-primary/10"
          />
          <p className="eyebrow">Your next step</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
            Take one thing
            <br />
            off your list.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-muted-foreground">
            Start with the service. We’ll keep the next steps clear.
          </p>
          <Link
            href="/services"
            className={buttonVariants({
              size: "lg",
              className: "mt-8 h-12 gap-3 px-6",
            })}
          >
            Find your service
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </Reveal>
    </div>
  )
}
