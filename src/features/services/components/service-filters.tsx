import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { ButtonLink } from "@/shared/components/button-link"
import { ChoiceSelect } from "@/shared/components/choice-select"
import type { parseServiceQuery } from "../schemas"

// Public browsing and administration share the same allowlisted URL filters.
export function ServiceFilters({
  query,
  pathname,
}: {
  query: ReturnType<typeof parseServiceQuery>
  pathname: "/services" | "/admin/services"
}) {
  return (
    <Card className="mb-8 border p-5 shadow-none">
      <form
        action={pathname}
        className="grid items-end gap-4 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor="service-search">Search services</Label>
          <Input
            key={query.q}
            id="service-search"
            name="q"
            maxLength={100}
            defaultValue={query.q}
            placeholder="Search by name or description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-sort">Sort by</Label>
          <ChoiceSelect
            key={query.sort}
            id="service-sort"
            name="sort"
            defaultValue={query.sort}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name_asc", label: "Name A–Z" },
              { value: "price_asc", label: "Price: low to high" },
              { value: "price_desc", label: "Price: high to low" },
            ]}
          />
        </div>
        <input type="hidden" name="limit" value={query.limit} />
        <Button type="submit">Apply filters</Button>
        <ButtonLink variant="ghost" href={pathname}>
          Clear
        </ButtonLink>
      </form>
    </Card>
  )
}
