"use client"

import { z } from "zod"
import { UrlFilterForm } from "@/shared/components/url-filter-form"
import { serviceSortSchema, type parseServiceQuery } from "../schemas"

const schema = z.strictObject({
  q: z.string().trim().max(100),
  sort: serviceSortSchema,
})

// Public browsing and administration share validated, bookmarkable filters.
export function ServiceFilters({
  query,
  pathname,
}: {
  query: ReturnType<typeof parseServiceQuery>
  pathname: "/services" | "/admin/services"
}) {
  return (
    <UrlFilterForm
      pathname={pathname}
      schema={schema}
      values={{ q: query.q, sort: query.sort }}
      preserved={{ limit: query.limit }}
      fields={[
        {
          name: "q",
          label: "Search services",
          kind: "text",
          maxLength: 100,
          placeholder: "Search by name or description",
        },
        {
          name: "sort",
          label: "Sort by",
          kind: "select",
          options: [
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "name_asc", label: "Name A–Z" },
            { value: "price_asc", label: "Price: low to high" },
            { value: "price_desc", label: "Price: high to low" },
          ],
        },
      ]}
    />
  )
}
