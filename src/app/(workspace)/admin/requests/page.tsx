import { RequestList } from "@/features/requests/components/request-list"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "Request review queue" }
export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  return <RequestList role="ADMIN" values={await searchParams} />
}
