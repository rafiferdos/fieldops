import Link from "next/link"
import { getRequest } from "@/features/requests/server"
import { canCancelRequest } from "@/features/requests/schemas"
import { RequestEditForm } from "@/features/requests/components/request-edit-form"
import { CancelRequestDialog } from "@/features/requests/components/cancel-request-dialog"
import { PageHeading } from "@/shared/components/page-heading"
import { formatDate } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/badge"

export const metadata = { title: "Request details" }
export default async function RequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const request = await getRequest((await params).requestId)
  return (
    <>
      <Link
        href="/customer"
        className="mb-7 inline-block text-sm underline underline-offset-4"
      >
        Back to My requests
      </Link>
      <PageHeading
        eyebrow="Request details"
        title={request.service.name}
        description={`Request ${request.id}`}
        action={
          canCancelRequest(request) ? (
            <CancelRequestDialog
              key={request.version}
              id={request.id}
              version={request.version}
            />
          ) : undefined
        }
      />
      <Badge variant="secondary">{request.status}</Badge>
      <dl className="mt-7 grid max-w-4xl gap-6 sm:grid-cols-2">
        {[
          ["Description", request.description],
          ["Service address", request.address],
          ["Preferred visit", formatDate(request.preferredStart)],
          ["Submitted", formatDate(request.createdAt)],
          ...(request.reviewReason
            ? [["Review reason", request.reviewReason]]
            : []),
          ...(request.cancellationReason
            ? [["Cancellation reason", request.cancellationReason]]
            : []),
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 break-words whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </dl>
      {request.workOrder && (
        <section className="mt-8 rounded-2xl border p-5">
          <h2 className="font-heading text-xl font-medium">Assigned work</h2>
          <p className="mt-3">Work status: {request.workOrder.status}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(request.workOrder.scheduledStart)} →{" "}
            {formatDate(request.workOrder.scheduledEnd)}
          </p>
        </section>
      )}
      {request.status === "PENDING" && (
        <RequestEditForm key={request.version} request={request} />
      )}
    </>
  )
}
