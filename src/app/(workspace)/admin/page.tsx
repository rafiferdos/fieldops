import { PageHeading } from "@/shared/components/page-heading"
import { requireViewer } from "@/features/auth/session"
import { getOverview } from "@/features/admin/server"
import { parseOverviewFilters } from "@/features/admin/schemas"
import { OverviewDetails } from "@/features/admin/components/overview"
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
  return (
    <>
      <PageHeading
        eyebrow="Administrator workspace"
        title="Operations overview"
        description="A clear view of service demand, completed work and provider-verified revenue."
      />
      <OverviewFilters
        from={firstValue(values.from) ?? ""}
        to={firstValue(values.to) ?? ""}
        error={
          parsed.success
            ? undefined
            : "Provide both valid dates in increasing order, at most 366 days apart."
        }
      />
      {parsed.success && (
        <OverviewDetails overview={await getOverview(parsed.data)} />
      )}
    </>
  )
}
