import { ButtonLink } from "@/shared/components/button-link"
import { ArrowUpRight } from "lucide-react"
import { ContentImage } from "@/shared/components/content-image"
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
        <ContentImage
          src={service.imageUrl}
          alt={service.name}
          className="mb-7 h-44 border"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 384px"
        />
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
        <ButtonLink variant="outline" href={`/services/${service.id}`}>
          View service
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
