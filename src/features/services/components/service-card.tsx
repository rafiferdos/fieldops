import { Button } from "@/shared/ui/button"
import Link from "next/link"
import { ArrowUpRight, Wrench } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { formatMoney } from "@/shared/lib/format"
import type { Service } from "../schemas"

// Keep the API's base price visible without implying a confirmed quote or booking.
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="interactive-card group h-full border shadow-none">
      <CardHeader>
        <div
          aria-hidden="true"
          className="relative mb-7 flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-primary/10 bg-primary/5"
        >
          <span className="absolute size-36 rounded-full border border-primary/10" />
          <span className="absolute size-24 rounded-full border border-primary/15" />
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/10 bg-card text-brand-ink shadow-sm">
            <Wrench className="size-6" />
          </span>
        </div>
        <CardTitle className="font-heading text-2xl tracking-tight">
          {service.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-4 border-t bg-muted/20 pb-1">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Base price</p>
          <p className="font-heading text-xl font-medium tabular-nums">
            {formatMoney(service.basePriceMinor)}
          </p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/services/${service.id}`} />}
        >
          View service
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
