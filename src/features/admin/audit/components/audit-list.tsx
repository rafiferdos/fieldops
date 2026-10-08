import { Card } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import { formatDate } from "@/shared/lib/format"
import type { AuditEvent } from "../schemas"

// Append-only event details use an allowlisted projection, never an arbitrary JSON dump.
export function AuditList({ events }: { events: AuditEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id}>
          <Card
            data-audit-id={event.id}
            data-entity-id={event.entityId}
            className="min-w-0 border p-6 shadow-none"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline">{event.entityType}</Badge>
              <time
                dateTime={event.createdAt}
                className="text-xs text-muted-foreground"
              >
                {formatDate(event.createdAt)}
              </time>
            </div>
            <h2 className="font-heading text-lg font-medium break-all">
              {event.action}
            </h2>
            <dl className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Entity ID</dt>
                <dd className="mt-1 font-mono break-all">{event.entityId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Actor ID</dt>
                <dd className="mt-1 font-mono break-all">
                  {event.actorId ?? "System"}
                </dd>
              </div>
            </dl>
            {Object.keys(event.metadata).length ? (
              <Collapsible>
                <CollapsibleTrigger render={<Button variant="ghost" />}>
                  View safe metadata
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <dl className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{key}</dt>
                        <dd className="mt-1 break-words">
                          {Array.isArray(value)
                            ? value.length
                              ? value.join(", ")
                              : "Empty list"
                            : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <p className="text-xs text-muted-foreground">
                No additional safe metadata.
              </p>
            )}
          </Card>
        </li>
      ))}
    </ol>
  )
}
