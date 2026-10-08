import { getRequest } from "@/features/requests/server"
import { RequestDetails } from "@/features/requests/components/request-details"
import { ReviewForm } from "@/features/dispatch/components/review-form"
import { SchedulingPanel } from "@/features/dispatch/components/scheduling-panel"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "Review and dispatch" }
export default async function AdminRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>
  searchParams: Promise<SearchValues>
}) {
  const request = await getRequest((await params).requestId, "ADMIN")
  return (
    <>
      <RequestDetails role="ADMIN" request={request} />
      {request.status === "PENDING" && (
        <ReviewForm
          key={request.version}
          id={request.id}
          version={request.version}
        />
      )}
      {request.status === "APPROVED" && !request.workOrder && (
        <SchedulingPanel
          target={{ kind: "assign", id: request.id }}
          serviceId={request.serviceId}
          pathname={`/admin/requests/${request.id}`}
          values={await searchParams}
        />
      )}
    </>
  )
}
