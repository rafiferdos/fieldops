import { WorkList } from "@/features/work-orders/components/work-list"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "Dispatch follow-up" }
export default async function AdminWorkPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  return <WorkList role="ADMIN" values={await searchParams} />
}
