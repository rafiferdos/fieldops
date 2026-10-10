import { publicMetadata } from "@/infrastructure/seo/metadata"
import Link from "next/link"
import { Suspense } from "react"
import { PageSkeleton } from "@/shared/components/page-skeleton"
import { FeaturedServices } from "@/features/marketing/components/featured-services"
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  FileCheck2,
  Wrench,
} from "lucide-react"
import { ServiceScene } from "@/features/marketing/components/service-scene"
import { MarketingMotion } from "@/features/marketing/components/marketing-motion"
import { ProcessSection } from "@/features/marketing/components/process-section"
import { AnimatedArtwork } from "@/shared/components/react-bits/animated-artwork"
import { BorderGlow } from "@/shared/components/react-bits/border-glow"
import { ScrollWords } from "@/features/marketing/components/scroll-words"
import { TechText } from "@/shared/components/react-bits/tech-text"
import { FaqCards } from "@/features/marketing/components/faq-cards"
import { Reveal } from "@/shared/components/reveal"
import { buttonVariants } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

export const metadata = publicMetadata(
  "Home",
  "Find a service, plan a visit and follow the work through completion with FieldOps.",
  "/"
)

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <MarketingMotion>
      <div className="space-y-24 sm:space-y-32">
        <section
          data-motion-managed=""
          className="hero-editorial"
          aria-labelledby="hero-title"
        >
          <div
            data-hero-intro=""
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <p className="eyebrow flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" /> Service,
              with a clear next step
            </p>
            <span className="hidden font-mono text-[10px] tracking-[0.12em] text-muted-foreground sm:block">
              REQUEST / COORDINATE / RESOLVE
            </span>
          </div>
          {/* Word boundaries and spaces stay identical before, during and after GSAP entry. */}
          <h1 id="hero-title" className="hero-title">
            <span className="hero-title-copy block">
              <span className="hero-word" data-hero-word="">
                Less
              </span>{" "}
              <span className="hero-word" data-hero-word="">
                chasing.
              </span>
            </span>{" "}
            <span className="hero-title-line">
              <span className="hero-tool" data-tool="" aria-hidden="true">
                <Wrench />
              </span>
              <span className="hero-title-copy">
                <span className="hero-word" data-hero-word="">
                  More
                </span>{" "}
                <span className="hero-word text-brand-ink" data-hero-word="">
                  <TechText text="handled." />
                </span>
              </span>
            </span>
          </h1>
          <div className="hero-rule" data-hero-rule="" />
          <div className="hero-bottom" data-hero-intro="">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              A simpler way to get things fixed. Find the right service, plan a
              visit, and follow every step to completion.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/services"
                className={buttonVariants({
                  size: "lg",
                  className: "group/cta h-12 gap-5 rounded-full px-6",
                })}
              >
                Explore services
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover/cta:translate-x-0.5"
                />
              </Link>
              <Link
                href="/about"
                className={buttonVariants({
                  variant: "ghost",
                  size: "lg",
                  className: "h-12 rounded-full px-5",
                })}
              >
                See how it works
              </Link>
            </div>
          </div>
          <Reveal>
            <ServiceScene />
          </Reveal>
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
                <ScrollWords>The right help.</ScrollWords>
                <br />
                <ScrollWords>A better starting point.</ScrollWords>
              </h2>
            </div>
            <Link href="/services" className="text-link">
              View all services
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Reveal>
          <Suspense fallback={<PageSkeleton />}>
            <FeaturedServices />
          </Suspense>
        </section>

        <ProcessSection />

        <Reveal>
          <BorderGlow>
            <Card
              aria-labelledby="roles-title"
              role="region"
              className="gap-0 border-0 bg-transparent p-6 shadow-none sm:p-10 lg:p-12"
            >
              <div className="grid items-center gap-6 md:grid-cols-[1fr_0.7fr]">
                <div>
                  <p className="eyebrow">Connected by design</p>
                  <h2
                    id="roles-title"
                    className="mt-4 max-w-xl font-heading text-3xl font-medium tracking-tight sm:text-4xl"
                  >
                    Three roles. One shared picture.
                  </h2>
                </div>
                <AnimatedArtwork kind="crystal" />
              </div>
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
                    <h3 className="font-heading text-xl font-medium">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </BorderGlow>
        </Reveal>
        <section aria-labelledby="home-faq-title">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Good questions. Clear answers.</p>
              <h2
                id="home-faq-title"
                className="mt-4 font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl"
              >
                A little clarity.
                <br />
                <span className="text-muted-foreground">Before we begin.</span>
              </h2>
            </div>
            <Link href="/faq" className="text-link">
              All your questions
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Reveal>
          <FaqCards preview />
        </section>
        <Reveal>
          <Card
            className="coordination-stage gap-0 px-6 py-14 text-center sm:py-20"
            role="region"
            aria-labelledby="next-step-title"
          >
            <AnimatedArtwork kind="strands" />
            <p className="eyebrow">Your next step</p>
            <h2
              id="next-step-title"
              className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl"
            >
              <ScrollWords>Take one thing</ScrollWords>
              <br />
              <ScrollWords>off your list.</ScrollWords>
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
          </Card>
        </Reveal>
      </div>
    </MarketingMotion>
  )
}
