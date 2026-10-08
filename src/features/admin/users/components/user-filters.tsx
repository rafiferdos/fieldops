import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { ButtonLink } from "@/shared/components/button-link"
import { ChoiceSelect } from "@/shared/components/choice-select"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"

// A GET submission resets pagination while preserving the selected page size.
export function UserFilters({
  values,
  limit,
}: {
  values: SearchValues
  limit: number
}) {
  // Preserve entered fields after validation errors without using them for an API read.
  const query = {
    q: firstValue(values.q) ?? "",
    role: firstValue(values.role) || undefined,
    status: firstValue(values.status) || undefined,
    sort: firstValue(values.sort) ?? "newest",
  }
  return (
    <Card className="mb-8 border p-5 shadow-none">
      <form
        action="/admin/users"
        className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="min-w-0 space-y-2">
          <Label htmlFor="user-search">Search users</Label>
          <Input
            key={query.q}
            id="user-search"
            name="q"
            maxLength={100}
            defaultValue={query.q}
            placeholder="Name or email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-role">Role</Label>
          <ChoiceSelect
            key={query.role ?? "all"}
            id="user-role"
            name="role"
            defaultValue={query.role ?? ""}
            options={[
              { value: "", label: "All roles" },
              { value: "CUSTOMER", label: "Customer" },
              { value: "TECHNICIAN", label: "Technician" },
              { value: "ADMIN", label: "Administrator" },
            ]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-status">Account status</Label>
          <ChoiceSelect
            key={query.status ?? "all"}
            id="user-status"
            name="status"
            defaultValue={query.status ?? ""}
            options={[
              { value: "", label: "All statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "SUSPENDED", label: "Suspended" },
            ]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-sort">Sort users</Label>
          <ChoiceSelect
            key={query.sort}
            id="user-sort"
            name="sort"
            defaultValue={query.sort}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </div>
        <input type="hidden" name="limit" value={limit} />
        <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-4">
          <Button type="submit">Apply filters</Button>
          <ButtonLink href="/admin/users" variant="ghost">
            Clear filters
          </ButtonLink>
        </div>
      </form>
    </Card>
  )
}
