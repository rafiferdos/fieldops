import { WorkList } from "@/features/work-orders/components/work-list"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "Assigned visits" }
export default async function TechnicianPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  return <WorkList role="TECHNICIAN" values={await searchParams} />
}
