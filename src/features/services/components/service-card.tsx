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

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <Wrench className="mb-5 size-6 text-primary" />
        <CardTitle className="font-heading text-xl">{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-4 border-t pt-5">
        <div>
          <p className="text-xs text-muted-foreground">Base price</p>
          <p className="font-semibold">{formatMoney(service.basePriceMinor)}</p>
        </div>
        <Link
          href={`/services/${service.id}`}
          className="flex items-center gap-1 text-sm font-medium text-primary"
        >
          View service
          <ArrowUpRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}
