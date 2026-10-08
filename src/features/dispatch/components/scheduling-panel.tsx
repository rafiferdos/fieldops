import type { SearchValues } from "@/shared/lib/list-query"
import type { RecordRoute } from "@/shared/lib/routes"
import { findTechnicians } from "../server"
import { parseAvailabilitySearch } from "../schemas"
import { ScheduleForm, type ScheduleTarget } from "./schedule-form"

// URL windows survive conflict reloads; every search rechecks actual availability.
export async function SchedulingPanel({
  serviceId,
  target,
  pathname,
  values,
}: {
  serviceId: string
  target: ScheduleTarget
  pathname: RecordRoute
  values: SearchValues
}) {
  const search = parseAvailabilitySearch(values)
  const availability = search
    ? await findTechnicians(serviceId, search, search.page)
    : null
  return (
    <ScheduleForm
      key={`${search?.start}:${search?.end}:${search?.page}`}
      target={target}
      pathname={pathname}
      search={search}
      availability={availability}
    />
  )
}
