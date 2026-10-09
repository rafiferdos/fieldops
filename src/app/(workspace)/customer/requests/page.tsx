import { RequestList } from "@/features/requests/components/request-list"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "My requests" }
export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  return <RequestList role="CUSTOMER" values={await searchParams} />
}
