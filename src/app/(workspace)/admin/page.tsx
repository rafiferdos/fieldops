import { PageHeading } from "@/shared/components/page-heading"
import { requireViewer } from "@/features/auth/session"
import { DashboardServer } from "@/features/workspace/components/dashboard-server"
import { parseOverviewFilters } from "@/features/admin/schemas"
import { OverviewFilters } from "@/features/admin/components/overview-filters"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"

export const metadata = { title: "Operations overview" }
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  await requireViewer("ADMIN", "/admin")
  const values = await searchParams,
    parsed = parseOverviewFilters(values)
  const controls = (
    <OverviewFilters
      from={firstValue(values.from) ?? ""}
      to={firstValue(values.to) ?? ""}
      error={
        parsed.success
          ? undefined
          : "Provide both valid dates in increasing order, at most 366 days apart."
      }
    />
  )
  // Invalid URL periods never trigger a report request or show a different period silently.
  return parsed.success ? (
    <DashboardServer role="ADMIN" filters={parsed.data}>
      {controls}
    </DashboardServer>
  ) : (
    <>
      <PageHeading
        title="Operations overview"
        description="Choose a valid period to inspect service demand and verified revenue."
      />
      {controls}
    </>
  )
}
