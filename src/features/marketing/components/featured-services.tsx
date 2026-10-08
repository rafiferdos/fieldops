import Link from "next/link"
import { ArrowRight, ClipboardList } from "lucide-react"
import { listServices } from "@/features/services/server"
import { ServiceCard } from "@/features/services/components/service-card"
import { Reveal } from "@/shared/components/reveal"
import { EmptyState } from "@/shared/components/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { cn } from "@/shared/lib/utils"
import { ApiError } from "@/infrastructure/api/error"

// Catalog latency must not delay the homepage's readable headline and navigation.
export async function FeaturedServices() {
  let services: Awaited<ReturnType<typeof listServices>>
  try {
    services = await listServices({ q: "", page: 1, limit: 3, sort: "newest" })
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    // A catalog outage must not replace the readable public journey with a page error.
    return (
      <EmptyState title="The catalog is taking a moment">
        <p>Services could not be loaded. Open the catalog to try again.</p>
        <Link href="/services" className="text-link mt-4">
          Open service catalog
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </EmptyState>
    )
  }
  if (!services.items.length)
    return (
      <EmptyState title="No services available yet">
        Please check back when the catalog is updated.
      </EmptyState>
    )
  return (
    <Reveal
      stagger
      className={cn(
        "grid gap-5 sm:grid-cols-2",
        services.items.length > 1 && "lg:grid-cols-3"
      )}
    >
      {services.items.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
      {services.items.length === 1 && (
        <Card className="border bg-muted/20 shadow-none sm:justify-center sm:p-4">
          <CardHeader>
            <ClipboardList
              aria-hidden="true"
              className="mb-5 size-6 text-brand-ink"
            />
            <p className="eyebrow">A good place to start</p>
            <CardTitle className="mt-2 max-w-sm text-3xl leading-tight tracking-tight">
              You bring the details.
              <br />
              We keep the steps clear.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Choose a service to read what it covers and see the base price.
              Your guided request collects the issue, address and preferred
              visit time.
            </p>
            <Link href="/about" className="text-link mt-6">
              See what happens next
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </CardContent>
        </Card>
      )}
    </Reveal>
  )
}
