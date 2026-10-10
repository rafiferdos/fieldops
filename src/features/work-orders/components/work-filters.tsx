"use client"

import { z } from "zod"
import { UrlFilterForm } from "@/shared/components/url-filter-form"
import { workStatusSchema } from "../status"
import type { parseWorkQuery } from "../schemas"
import type { workListPath } from "../routes"

const schema = z.strictObject({
  q: z.string().trim().max(100),
  status: workStatusSchema.or(z.literal("")),
  sort: z.enum(["newest", "oldest", "scheduled_start_asc"]),
})

// The server still selects the authorized role scope after URL navigation.
export function WorkFilters({
  query,
  pathname,
}: {
  query: ReturnType<typeof parseWorkQuery>
  pathname: ReturnType<typeof workListPath>
}) {
  return (
    <UrlFilterForm
      {...{ pathname, schema }}
      preserved={{ limit: query.limit, serviceId: query.serviceId }}
      values={{ q: query.q, status: query.status ?? "", sort: query.sort }}
      fields={[
        {
          name: "q",
          label: "Search work orders",
          kind: "text",
          maxLength: 100,
        },
        {
          name: "status",
          label: "Work status",
          kind: "select",
          options: [
            { value: "", label: "All statuses" },
            ...workStatusSchema.options.map((value) => ({
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
            { value: "scheduled_start_asc", label: "Scheduled visit" },
          ],
        },
      ]}
    />
  )
}
