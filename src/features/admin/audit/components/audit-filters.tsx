import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { ButtonLink } from "@/shared/components/button-link"
import { ChoiceSelect } from "@/shared/components/choice-select"
import { DatePicker } from "@/shared/components/date-picker"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"

// Filters are bookmarkable; an exact action or identity never becomes a guessed API parameter.
export function AuditFilters({
  values,
  limit,
}: {
  values: SearchValues
  limit: number
}) {
  // Keep incomplete periods editable; the route withholds results until the whole query is valid.
  const query = {
    entityType: firstValue(values.entityType) ?? "",
    entityId: firstValue(values.entityId) ?? "",
    actorId: firstValue(values.actorId) ?? "",
    action: firstValue(values.action) ?? "",
    from: firstValue(values.from) ?? "",
    to: firstValue(values.to) ?? "",
  }
  return (
    <Card className="mb-8 border p-5 shadow-none">
      <form
        action="/admin/audit-logs"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div className="space-y-2">
          <Label htmlFor="audit-entity-type">Entity type</Label>
          <ChoiceSelect
            key={query.entityType ?? "all"}
            id="audit-entity-type"
            name="entityType"
            defaultValue={query.entityType ?? ""}
            options={[
              { value: "", label: "All entities" },
              { value: "USER", label: "User" },
              { value: "SERVICE", label: "Service" },
              { value: "REQUEST", label: "Request" },
              { value: "WORK_ORDER", label: "Work order" },
              { value: "INVOICE", label: "Invoice" },
              { value: "PAYMENT", label: "Payment" },
            ]}
          />
        </div>
        {(
          [
            {
              name: "entityId",
              label: "Entity ID",
              max: 36,
              placeholder: "Exact record UUID",
            },
            {
              name: "actorId",
              label: "Actor ID",
              max: 36,
              placeholder: "Exact user UUID",
            },
            {
              name: "action",
              label: "Action (exact)",
              max: 80,
              placeholder: "USER_ACCESS_UPDATED",
            },
          ] as const
        ).map((field) => (
          <div key={field.name} className="min-w-0 space-y-2">
            <Label htmlFor={`audit-${field.name}`}>{field.label}</Label>
            <Input
              key={query[field.name] ?? ""}
              id={`audit-${field.name}`}
              name={field.name}
              defaultValue={query[field.name] ?? ""}
              maxLength={field.max}
              placeholder={field.placeholder}
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
        ))}
        <div className="min-w-0 space-y-2">
          <Label htmlFor="audit-from">From (Dhaka)</Label>
          <DatePicker
            key={query.from}
            id="audit-from"
            name="from"
            label="From (Dhaka)"
            defaultValue={query.from}
          />
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="audit-to">To (exclusive, Dhaka)</Label>
          <DatePicker
            key={query.to}
            id="audit-to"
            name="to"
            label="To (exclusive, Dhaka)"
            defaultValue={query.to}
          />
        </div>
        <input type="hidden" name="limit" value={limit} />
        <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-3">
          <Button type="submit">Apply filters</Button>
          <ButtonLink href="/admin/audit-logs" variant="ghost">
            Clear filters
          </ButtonLink>
        </div>
      </form>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Use exact IDs and uppercase action names. Dates are paired, inclusive
        from and exclusive to, with at most 366 days. Events are always newest
        first.
      </p>
    </Card>
  )
}
