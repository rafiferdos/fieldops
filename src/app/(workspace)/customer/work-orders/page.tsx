import { WorkList } from "@/features/work-orders/components/work-list"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "My work orders" }
export default async function CustomerWorkPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  return <WorkList role="CUSTOMER" values={await searchParams} />
}
