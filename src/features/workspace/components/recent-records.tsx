import { ArrowRight } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { ButtonLink } from "@/shared/components/button-link"
import { EmptyState } from "@/shared/components/empty-state"
import { formatDate } from "@/shared/lib/format"
import { workDetailPath, workListPath } from "@/features/work-orders/routes"
import type { Dashboard } from "../schemas"

export function RecentRecords({ data }: { data: Dashboard }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {data.role !== "TECHNICIAN" && (
        <Card className="min-w-0 border shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              Recent requests
            </CardTitle>
            <CardDescription>
              Your five most recently created accessible requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.requests.recent.length ? (
              <ul className="divide-y">
                {data.requests.recent.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="font-medium break-words">
                        {request.service.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested {formatDate(request.createdAt)}
                      </p>
                      <Badge
                        variant="outline"
                        className="status-badge"
                        data-status={request.status}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <ButtonLink
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${request.service.name} request`}
                      href={
                        data.role === "ADMIN"
                          ? `/admin/requests/${request.id}`
                          : `/customer/requests/${request.id}`
                      }
                    >
                      <ArrowRight aria-hidden="true" />
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No requests yet">
                {data.role === "CUSTOMER" ? (
                  <ButtonLink href="/customer/requests/new">
                    Create your first request
                  </ButtonLink>
                ) : (
                  "New requests will appear here for review."
                )}
              </EmptyState>
            )}
            <ButtonLink
              variant="outline"
              className="mt-4 w-full"
              href={
                data.role === "ADMIN" ? "/admin/requests" : "/customer/requests"
              }
            >
              All requests
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </CardContent>
        </Card>
      )}
      <Card className="min-w-0 border shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Recent service visits
          </CardTitle>
          <CardDescription>
            Latest work records with their confirmed schedules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.work.recent.length ? (
            <ul className="divide-y">
              {data.work.recent.map((work) => (
                <li
                  key={work.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium break-words">
                      {work.request.service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(work.scheduledStart)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="status-badge"
                        data-status={work.status}
                      >
                        {work.status}
                      </Badge>
                      {work.invoice && (
                        <Badge variant="outline">
                          Invoice {work.invoice.status.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ButtonLink
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${work.request.service.name} visit`}
                    href={workDetailPath(data.role, work.id)}
                  >
                    <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No assigned visits yet">
              Confirmed service schedules will appear here.
            </EmptyState>
          )}
          <ButtonLink
            variant="outline"
            className="mt-4 w-full"
            href={workListPath(data.role)}
          >
            All visits
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </CardContent>
      </Card>
      {data.role === "TECHNICIAN" && (
        <Card className="border shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              Ready for your next visit
            </CardTitle>
            <CardDescription>
              Start with scheduled work, record your progress, and submit a
              completion report after the job.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <ButtonLink href="/technician/work-orders?status=ASSIGNED&sort=scheduled_start_asc">
              Open scheduled visits
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              variant="outline"
              href="/technician/work-orders?status=IN_PROGRESS"
            >
              Continue work in progress
            </ButtonLink>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
