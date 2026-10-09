import type { Route } from "next"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { ButtonLink } from "./button-link"

export interface StatCardProps {
  label: string
  value: string | number
  detail: string
  icon: LucideIcon
  href?: Route
}

// Every metric carries its meaning and optional drill-down instead of invented growth.
export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  href,
}: StatCardProps) {
  return (
    <Card
      className="stat-card min-w-0 gap-4 border shadow-none"
      data-metric={label}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
        <Icon aria-hidden="true" className="size-5 shrink-0 text-brand-ink" />
      </CardHeader>
      <CardContent className="space-y-3">
        <p
          className="font-heading text-3xl leading-tight font-medium tracking-tight break-words tabular-nums"
          data-metric-value=""
        >
          {value}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {detail}
        </p>
        {href && (
          <ButtonLink
            href={href}
            variant="ghost"
            size="sm"
            className="-ml-3 justify-start text-xs"
          >
            View records
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        )}
      </CardContent>
    </Card>
  )
}
