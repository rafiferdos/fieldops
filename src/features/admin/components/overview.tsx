import { Receipt, ClipboardList, CalendarCheck2, Users } from "lucide-react"
import { ButtonLink } from "@/shared/components/button-link"
import { EmptyState } from "@/shared/components/empty-state"
import { Card } from "@/shared/ui/card"
import { formatDate } from "@/shared/lib/format"
import { formatRevenue, type Overview } from "../schemas"
import { RequestChart } from "./request-chart"

export function OverviewDetails({ overview }: { overview: Overview }) {
  const data = (["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const).map(
    (status) => ({ status, count: overview.requests.byStatus[status] ?? 0 })
  )
  return (
    <>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Period: {formatDate(overview.period.from)} up to{" "}
        {formatDate(overview.period.to)} (exclusive). Requests and work use
        creation time; revenue uses paid time. Technician counts are current.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Verified revenue",
            value: formatRevenue(overview.invoices.verifiedRevenueMinor),
            detail: `${overview.invoices.paidCount} paid invoices, counted once`,
            icon: Receipt,
          },
          {
            label: "Requests",
            value: overview.requests.total.toLocaleString("en-BD"),
            detail: "Created within the selected period",
            icon: ClipboardList,
          },
          {
            label: "Work completed",
            value: `${overview.workOrders.completed} / ${overview.workOrders.total}`,
            detail: `${overview.workOrders.completionRate}% of work created in the period`,
            icon: CalendarCheck2,
          },
          {
            label: "Active technicians",
            value: `${overview.technicians.active} / ${overview.technicians.total}`,
            detail: "Current non-deleted technician accounts",
            icon: Users,
          },
        ].map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="min-w-0 border p-6 shadow-none">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">{label}</h2>
              <Icon
                aria-hidden="true"
                className="size-5 shrink-0 text-brand-ink"
              />
            </div>
            <p className="font-heading text-2xl font-medium break-words tabular-nums">
              {value}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {detail}
            </p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 border p-6 shadow-none sm:p-8">
        <h2 className="font-heading text-2xl font-medium">
          Request status distribution
        </h2>
        {overview.requests.total ? (
          <RequestChart data={data} />
        ) : (
          <EmptyState title="No requests in this period">
            Choose a different date range to inspect its creation cohort.
          </EmptyState>
        )}
        {/* Exact text counts remain available without JavaScript and beyond chart color/hover. */}
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {data.map((row) => (
            <div key={row.status}>
              <dt className="text-xs text-muted-foreground">{row.status}</dt>
              <dd className="mt-2 font-medium tabular-nums">{row.count}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/admin/requests">Review requests</ButtonLink>
        <ButtonLink variant="outline" href="/admin/work-orders">
          Follow work orders
        </ButtonLink>
      </div>
    </>
  )
}
