"use client"

import { z } from "zod"
import { UrlFilterForm } from "@/shared/components/url-filter-form"
import { requestStatusSchema, type parseRequestQuery } from "../schemas"

const schema = z.strictObject({
  q: z.string().trim().max(100),
  status: requestStatusSchema.or(z.literal("")),
  sort: z.enum(["newest", "oldest", "preferred_start_asc"]),
})

// Filtering never mutates requests; explicit service scope survives a new search.
export function RequestFilters({
  query,
  pathname,
}: {
  query: ReturnType<typeof parseRequestQuery>
  pathname: "/admin/requests" | "/customer/requests"
}) {
  return (
    <UrlFilterForm
      {...{ pathname, schema }}
      preserved={{ limit: query.limit, serviceId: query.serviceId }}
      values={{ q: query.q, status: query.status ?? "", sort: query.sort }}
      fields={[
        { name: "q", label: "Search requests", kind: "text", maxLength: 100 },
        {
          name: "status",
          label: "Status",
          kind: "select",
          options: [
            { value: "", label: "All statuses" },
            ...requestStatusSchema.options.map((value) => ({
              value,
              label: value,
            })),
          ],
        },
        {
          name: "sort",
          label: "Sort by",
          kind: "select",
          options: [
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "preferred_start_asc", label: "Preferred visit" },
          ],
        },
      ]}
    />
  )
}
