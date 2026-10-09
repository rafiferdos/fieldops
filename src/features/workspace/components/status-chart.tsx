"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart"
import { EmptyState } from "@/shared/components/empty-state"

const config = {
  count: { label: "Records", color: "var(--chart-3)" },
} satisfies ChartConfig

export function StatusChart({
  title,
  description,
  counts,
  emptyTitle = "No records yet",
}: {
  title: string
  description: string
  counts: Record<string, number>
  emptyTitle?: string
}) {
  const rows = Object.entries(counts).map(([status, count]) => ({
    status: status.replaceAll("_", " ").toLowerCase(),
    count,
  }))
  const hasRecords = rows.some((row) => row.count > 0)
  return (
    <Card className="min-w-0 border shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasRecords ? (
          <ChartContainer config={config} className="h-56 w-full">
            <BarChart
              accessibilityLayer
              data={rows}
              margin={{ left: 0, right: 10 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="status"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={10}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState title={emptyTitle}>
            Counts will appear as your service work progresses.
          </EmptyState>
        )}
        {/* Exact labels make the chart useful without color, hover or JavaScript. */}
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t pt-4">
          {rows.map((row) => (
            <div key={row.status}>
              <dt className="text-xs text-muted-foreground capitalize">
                {row.status}
              </dt>
              <dd className="mt-1 font-medium tabular-nums">{row.count}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
