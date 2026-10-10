"use client"

import { z } from "zod"
import { UrlFilterForm } from "@/shared/components/url-filter-form"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { parseAuditQuery } from "../schemas"

const schema = z
  .record(z.string(), z.string())
  .superRefine((values, context) => {
    const result = parseAuditQuery(values)
    if (!result.success)
      for (const issue of result.error.issues)
        context.addIssue({
          code: "custom",
          message: issue.message,
          path: issue.path.length ? issue.path : ["to"],
        })
  })

// MEDIA events are readable; only entity types accepted by the backend can be filtered.
export function AuditFilters({
  values,
  limit,
}: {
  values: SearchValues
  limit: number
}) {
  return (
    <>
      <UrlFilterForm
        pathname="/admin/audit-logs"
        schema={schema}
        preserved={{ limit }}
        values={{
          entityType: firstValue(values.entityType) ?? "",
          entityId: firstValue(values.entityId) ?? "",
          actorId: firstValue(values.actorId) ?? "",
          action: firstValue(values.action) ?? "",
          from: firstValue(values.from) ?? "",
          to: firstValue(values.to) ?? "",
        }}
        fields={[
          {
            name: "entityType",
            label: "Entity type",
            kind: "select",
            options: [
              { value: "", label: "All entities" },
              ...[
                "USER",
                "SERVICE",
                "REQUEST",
                "WORK_ORDER",
                "INVOICE",
                "PAYMENT",
              ].map((value) => ({ value, label: value.replaceAll("_", " ") })),
            ],
          },
          {
            name: "entityId",
            label: "Entity ID",
            kind: "text",
            maxLength: 36,
            placeholder: "Exact record UUID",
          },
          {
            name: "actorId",
            label: "Actor ID",
            kind: "text",
            maxLength: 36,
            placeholder: "Exact user UUID",
          },
          {
            name: "action",
            label: "Action (exact)",
            kind: "text",
            maxLength: 80,
            placeholder: "USER_ACCESS_UPDATED",
          },
          { name: "from", label: "From (Dhaka)", kind: "date" },
          { name: "to", label: "To (exclusive, Dhaka)", kind: "date" },
        ]}
      />
      <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
        Use exact IDs and uppercase action names. Dates are paired, inclusive
        from and exclusive to, with at most 366 days. Events are always newest
        first.
      </p>
    </>
  )
}
