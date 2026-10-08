import Link from "next/link"
import type { Role } from "@/features/auth/schemas"
import { PageHeading } from "@/shared/components/page-heading"
import { Badge } from "@/shared/ui/badge"
import { formatDate, formatMoney } from "@/shared/lib/format"
import { workListPath } from "../routes"
import type { WorkDetail } from "../schemas"

// Keep request decisions, execution status and invoice settlement visibly distinct.
export function WorkDetails({ work, role }: { work: WorkDetail; role: Role }) {
  return (
    <>
      <Link
        href={workListPath(role)}
        className="mb-7 inline-block text-sm underline"
      >
        Back to work orders
      </Link>
      <PageHeading
        eyebrow="Work order"
        title={work.request.service.name}
        description={`Work ${work.id}`}
      />
      <div className="flex flex-wrap gap-3">
        <Badge>Work: {work.status}</Badge>
        <Badge variant="secondary">Request: {work.request.status}</Badge>
      </div>
      <dl className="mt-7 grid max-w-4xl gap-6 sm:grid-cols-2">
        {[
          ["Description", work.request.description],
          ["Service address", work.request.address],
          ["Assigned technician", work.technician.name],
          ["Visit start", formatDate(work.scheduledStart)],
          ["Visit end", formatDate(work.scheduledEnd)],
          ["Agreed price", formatMoney(work.agreedPriceMinor)],
          ...(work.completedAt
            ? [["Completed", formatDate(work.completedAt)]]
            : []),
          ...(work.cancelledAt
            ? [["Cancelled", formatDate(work.cancelledAt)]]
            : []),
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 break-words whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </dl>
      {role !== "TECHNICIAN" && (
        <Link
          href={
            role === "ADMIN"
              ? `/admin/requests/${work.requestId}`
              : `/customer/requests/${work.requestId}`
          }
          className="mt-6 inline-block text-sm underline"
        >
          View related request
        </Link>
      )}
      {work.report && (
        <section className="mt-8 max-w-3xl space-y-3 rounded-2xl border p-5">
          <h2 className="font-heading text-xl font-medium">
            Completion report
          </h2>
          <p className="break-words whitespace-pre-wrap">{work.report}</p>
        </section>
      )}
      {/* The completion response owns invoice creation; this screen only reads its snapshot. */}
      {work.invoice && (
        <section className="mt-8 max-w-3xl space-y-3 rounded-2xl border p-5">
          <h2 className="font-heading text-xl font-medium">Invoice summary</h2>
          <p className="text-sm break-all text-muted-foreground">
            Invoice {work.invoice.id}
          </p>
          <p>
            {formatMoney(work.invoice.amountMinor)} · {work.invoice.status}
          </p>
          <p className="text-sm">
            Issued {formatDate(work.invoice.issuedAt)}
            {work.invoice.paidAt
              ? ` · Paid ${formatDate(work.invoice.paidAt)}`
              : ""}
          </p>
        </section>
      )}
      {work.feedback && (
        <section className="mt-8 max-w-3xl space-y-3 rounded-2xl border p-5">
          <h2 className="font-heading text-xl font-medium">
            Customer feedback
          </h2>
          <p>
            {work.feedback.rating} out of 5 ·{" "}
            {formatDate(work.feedback.createdAt)}
          </p>
          {work.feedback.comment && (
            <p className="break-words whitespace-pre-wrap">
              {work.feedback.comment}
            </p>
          )}
        </section>
      )}
      <section className="mt-10 max-w-3xl space-y-5 border-t pt-8">
        <h2 className="font-heading text-xl font-medium">Visit timeline</h2>
        <p className="text-sm text-muted-foreground">
          Latest {work.timeline.length} events, up to 100. This is the
          work-order timeline.
        </p>
        <ol className="space-y-5 border-l pl-5">
          {work.timeline.map((event) => (
            <li key={event.id}>
              <p className="font-medium">
                {event.action.toLowerCase().replaceAll("_", " ")}
              </p>
              {event.metadata?.fromStatus && event.metadata.toStatus && (
                <p className="mt-1 text-sm">
                  {event.metadata.fromStatus} → {event.metadata.toStatus}
                </p>
              )}
              <time
                dateTime={event.createdAt}
                className="text-sm text-muted-foreground"
              >
                {formatDate(event.createdAt)}
              </time>
            </li>
          ))}
        </ol>
        {!work.timeline.length && <p>No timeline events are available.</p>}
      </section>
    </>
  )
}
