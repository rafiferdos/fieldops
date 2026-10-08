import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  FileCheck2,
  Wrench,
} from "lucide-react"
import { Reveal } from "@/shared/components/reveal"
import { getService } from "@/features/services/server"
import { PageHeading } from "@/shared/components/page-heading"
import { formatMoney } from "@/shared/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { buttonVariants } from "@/shared/ui/button"

export const metadata = { title: "Service details" }
export default async function ServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params
  const service = await getService(serviceId)
  return (
    <>
      <Link href="/services" className="text-link mb-7">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to services
      </Link>
      <PageHeading
        eyebrow="Service details"
        title={service.name}
        description="A clear starting point for your next service visit."
      />
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <section className="surface space-y-6 p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="flex h-44 items-center justify-center rounded-2xl bg-primary/5"
          >
            <Wrench className="size-14 text-primary/70" />
          </div>
          <h2 className="font-heading text-xl font-medium">
            About this service
          </h2>
          <p className="leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {service.description}
          </p>
          <div className="grid gap-4 border-t pt-6 sm:grid-cols-2">
            <p className="flex items-center gap-2 text-sm">
              <CalendarCheck2
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Coordinated visit
            </p>
            <p className="flex items-center gap-2 text-sm">
              <FileCheck2 aria-hidden="true" className="size-4 text-primary" />
              Completion report
            </p>
          </div>
        </section>
        <Reveal className="lg:sticky lg:top-28">
          <Card className="border bg-primary/5 shadow-none">
            <CardHeader>
              <CardTitle>Plan your visit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Base price</p>
                <p className="font-heading text-4xl font-medium tracking-tight">
                  {formatMoney(service.basePriceMinor)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                The price is recorded when your visit is assigned. Your invoice
                is issued when the work is completed.
              </p>
              <Link
                href={`/customer/requests/new?serviceId=${service.id}`}
                className={buttonVariants({ className: "h-11 w-full" })}
              >
                Request this service
                <ArrowRight aria-hidden="true" />
              </Link>
              <p className="text-xs text-muted-foreground">
                A customer account is required to make a request.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </>
  )
}
