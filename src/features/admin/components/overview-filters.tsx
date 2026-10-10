"use client"

import { UrlFilterForm } from "@/shared/components/url-filter-form"
import { FormMessage } from "@/shared/components/form-message"
import { overviewFilterSchema } from "../schemas"

// Period controls use the same paired-date policy as the authoritative server read.
export function OverviewFilters({
  from,
  to,
  error,
}: {
  from: string
  to: string
  error: string | undefined
}) {
  return (
    <>
      <UrlFilterForm
        pathname="/admin"
        values={{ from, to }}
        schema={overviewFilterSchema}
        submitLabel="Apply period"
        clearLabel="Last 30 days"
        fields={[
          { name: "from", label: "From (Dhaka)", kind: "date" },
          { name: "to", label: "To (exclusive, Dhaka)", kind: "date" },
        ]}
      />
      <FormMessage message={error} />
    </>
  )
}
