import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react"
import type { ServiceRequest } from "@/features/requests/schemas"
import { workDetailPath } from "@/features/work-orders/routes"
import { canCancelRequest } from "@/features/requests/schemas"
import { RequestEditForm } from "@/features/requests/components/request-edit-form"
import { CancelRequestDialog } from "@/features/requests/components/cancel-request-dialog"
import { PageHeading } from "@/shared/components/page-heading"
import { formatDate } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/badge"

// Shared request context keeps review state separate from assigned work progress.
export function RequestDetails({
  request,
  role,
}: {
  request: ServiceRequest
  role: "CUSTOMER" | "ADMIN"
}) {
  return (
    <>
      <Link
        href={role === "ADMIN" ? "/admin/requests" : "/customer"}
        className="text-link mb-7"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to requests
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
      <Badge
        variant="outline"
        className="status-badge"
        data-status={request.status}
      >
        {request.status}
      </Badge>
      <dl className="detail-grid mt-7 max-w-4xl">
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
        <section className="surface mt-8 max-w-4xl p-6 sm:p-8">
          <h2 className="flex items-center gap-3 font-heading text-xl font-medium">
            <CalendarDays
              aria-hidden="true"
              className="size-5 text-brand-ink"
            />
            Assigned work
          </h2>
          <Link
            href={workDetailPath(role, request.workOrder.id)}
            className="text-link mt-4"
          >
            Track work order
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <p className="mt-3">Work status: {request.workOrder.status}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(request.workOrder.scheduledStart)} →{" "}
            {formatDate(request.workOrder.scheduledEnd)}
          </p>
        </section>
      )}
      {role === "CUSTOMER" && request.status === "PENDING" && (
        <RequestEditForm key={request.version} request={request} />
      )}
    </>
  )
}
