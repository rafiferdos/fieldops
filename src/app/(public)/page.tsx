import Link from "next/link"
import {
  ArrowRight,
  ClipboardList,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react"
import { listServices } from "@/features/services/server"
import { ServiceCard } from "@/features/services/components/service-card"
import { EmptyState } from "@/shared/components/empty-state"
import { buttonVariants } from "@/shared/ui/button"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const services = await listServices({
    q: "",
    page: 1,
    limit: 3,
    sort: "newest",
  })
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-7">
          <p className="text-sm font-medium tracking-widest text-primary uppercase">
            A clearer way to get things fixed
          </p>
          <h1 className="max-w-3xl font-heading text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
            Your service request.
            <br />
            <span className="text-primary">Handled with care.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Find a service, tell us what needs attention, and follow the work
            from scheduling to completion. One place for every step.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/services" className={buttonVariants({ size: "lg" })}>
              Explore services
              <ArrowRight />
            </Link>
            <Link
              href="/about"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              See how it works
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border bg-muted/50 p-7 sm:p-10">
          <p className="mb-7 font-heading text-xl font-medium">
            From request to resolution
          </p>
          <ol className="space-y-7">
            {[
              {
                icon: ClipboardList,
                title: "Tell us what you need",
                text: "Choose a service and share your preferred visit time.",
              },
              {
                icon: CalendarCheck,
                title: "A qualified technician, scheduled",
                text: "An administrator reviews and assigns your service visit.",
              },
              {
                icon: ShieldCheck,
                title: "Track, complete, pay securely",
                text: "Follow progress and pay your invoice through the supported gateway.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">
                    {i + 1}. {title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-labelledby="services-title">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-primary">The service catalog</p>
            <h2
              id="services-title"
              className="mt-2 font-heading text-3xl font-semibold"
            >
              Find the right help
            </h2>
          </div>
          <Link
            href="/services"
            className="text-sm font-medium underline underline-offset-4"
          >
            View all services
          </Link>
        </div>
        {services.items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.items.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState title="No services available yet">
            Please check back when the catalog is updated.
          </EmptyState>
        )}
      </section>
    </div>
  )
}
