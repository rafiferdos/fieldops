"use client"

import { z } from "zod"
import { UrlFilterForm } from "@/shared/components/url-filter-form"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { roleSchema } from "@/features/auth/schemas"
import { userStatusSchema } from "../schemas"

const schema = z.strictObject({
  q: z.string().trim().max(100),
  role: roleSchema.or(z.literal("")),
  status: userStatusSchema.or(z.literal("")),
  sort: z.enum(["newest", "oldest"]),
})

// Invalid URL input remains editable; submission validates before replacing the view.
export function UserFilters({
  values,
  limit,
}: {
  values: SearchValues
  limit: number
}) {
  return (
    <UrlFilterForm
      pathname="/admin/users"
      schema={schema}
      preserved={{ limit }}
      values={{
        q: firstValue(values.q) ?? "",
        role: firstValue(values.role) ?? "",
        status: firstValue(values.status) ?? "",
        sort: firstValue(values.sort) ?? "newest",
      }}
      fields={[
        {
          name: "q",
          label: "Search users",
          kind: "text",
          maxLength: 100,
          placeholder: "Name or email",
        },
        {
          name: "role",
          label: "Role",
          kind: "select",
          options: [
            { value: "", label: "All roles" },
            { value: "CUSTOMER", label: "Customer" },
            { value: "TECHNICIAN", label: "Technician" },
            { value: "ADMIN", label: "Administrator" },
          ],
        },
        {
          name: "status",
          label: "Account status",
          kind: "select",
          options: [
            { value: "", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" },
          ],
        },
        {
          name: "sort",
          label: "Sort users",
          kind: "select",
          options: [
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ],
        },
      ]}
    />
  )
}
