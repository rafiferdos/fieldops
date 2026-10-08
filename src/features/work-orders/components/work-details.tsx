import { DetailPanel } from "@/shared/components/detail-panel"
import { Card } from "@/shared/ui/card"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  Receipt,
  Star,
} from "lucide-react"
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
      <Link href={workListPath(role)} className="text-link mb-7">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to work orders
      </Link>
      <PageHeading
        eyebrow="Work order"
        title={work.request.service.name}
        description={`Work ${work.id}`}
      />
      <div className="flex flex-wrap gap-3">
        <Badge
          variant="outline"
          className="status-badge"
          data-status={work.status}
        >
          Work: {work.status}
        </Badge>
        <Badge
          variant="outline"
          className="status-badge"
          data-status={work.request.status}
        >
          Request: {work.request.status}
        </Badge>
      </div>
      <DetailPanel className="mt-7 max-w-4xl">
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
      </DetailPanel>
      {role !== "TECHNICIAN" && (
        <Link
          href={
            role === "ADMIN"
              ? `/admin/requests/${work.requestId}`
              : `/customer/requests/${work.requestId}`
          }
          className="text-link mt-6"
        >
          View related request
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      )}
      {work.report && (
        <Card className="mt-8 max-w-4xl border p-6 shadow-none sm:p-8">
          <h2 className="flex items-center gap-3 font-heading text-xl font-medium">
            <FileText aria-hidden="true" className="size-5 text-brand-ink" />
            Completion report
          </h2>
          <p className="break-words whitespace-pre-wrap">{work.report}</p>
        </Card>
      )}
      {/* The completion response owns invoice creation; this screen only reads its snapshot. */}
      {work.invoice && (
        <Card className="mt-8 max-w-4xl border p-6 shadow-none sm:p-8">
          <h2 className="flex items-center gap-3 font-heading text-xl font-medium">
            <Receipt aria-hidden="true" className="size-5 text-brand-ink" />
            Invoice summary
          </h2>
          <p className="text-sm break-all text-muted-foreground">
            Invoice {work.invoice.id}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-heading text-3xl font-medium tabular-nums">
              {formatMoney(work.invoice.amountMinor)}
            </p>
            <Badge variant="outline">{work.invoice.status}</Badge>
          </div>
          <p className="text-sm">
            Issued {formatDate(work.invoice.issuedAt)}
            {work.invoice.paidAt
              ? ` · Paid ${formatDate(work.invoice.paidAt)}`
              : ""}
          </p>
        </Card>
      )}
      {work.feedback && (
        <Card className="mt-8 max-w-4xl border p-6 shadow-none sm:p-8">
          <h2 className="flex items-center gap-3 font-heading text-xl font-medium">
            <Star aria-hidden="true" className="size-5 text-brand-ink" />
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
        </Card>
      )}
      <Card className="mt-10 max-w-4xl border p-6 shadow-none sm:p-8">
        <h2 className="flex items-center gap-3 font-heading text-xl font-medium">
          Visit timeline
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest {work.timeline.length} events, up to 100. This is the
          work-order timeline.
        </p>
        <ol className="relative space-y-7">
          {work.timeline.map((event) => (
            <li
              key={event.id}
              className="relative pl-12 before:absolute before:top-8 before:bottom-[-28px] before:left-4 before:w-px before:bg-border last:before:hidden"
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border bg-primary/5 text-brand-ink"
              >
                <Check className="size-3.5" />
              </span>
              <p className="font-medium capitalize">
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
      </Card>
    </>
  )
}
