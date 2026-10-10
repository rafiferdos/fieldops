import { Card } from "@/shared/ui/card"
import { DatePicker } from "@/shared/components/date-picker"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { ButtonLink } from "@/shared/components/button-link"
import { FormMessage } from "@/shared/components/form-message"

// GET filters remain bookmarkable and are validated before any report read.
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
    <Card className="mb-8 border p-5 shadow-none">
      <form action="/admin" className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="overview-from">From (Dhaka)</Label>
          <DatePicker
            key={from}
            id="overview-from"
            label="From (Dhaka)"
            name="from"
            defaultValue={from}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="overview-to">To (exclusive, Dhaka)</Label>
          <DatePicker
            key={to}
            id="overview-to"
            label="To (exclusive, Dhaka)"
            name="to"
            defaultValue={to}
          />
        </div>
        <Button type="submit">Apply period</Button>
        <ButtonLink href="/admin" variant="ghost">
          Last 30 days
        </ButtonLink>
      </form>
      <FormMessage message={error} />
    </Card>
  )
}
