import Link from "next/link"
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
      <Link
        href="/services"
        className="mb-7 inline-block text-sm text-muted-foreground underline underline-offset-4"
      >
        Back to services
      </Link>
      <PageHeading
        eyebrow="Service details"
        title={service.name}
        description="A clear starting point for your next service visit."
      />
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-medium">
            About this service
          </h2>
          <p className="leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {service.description}
          </p>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>Plan your visit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Base price</p>
              <p className="font-heading text-3xl font-semibold">
                {formatMoney(service.basePriceMinor)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              The price is recorded when your visit is assigned. Your invoice is
              issued when the work is completed.
            </p>
            <Link
              href={`/customer/requests/new?serviceId=${service.id}`}
              className={buttonVariants()}
            >
              Request this service
            </Link>
            <p className="text-xs text-muted-foreground">
              A customer account is required to make a request.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
