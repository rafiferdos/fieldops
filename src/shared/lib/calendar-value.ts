import { TZDate } from "react-day-picker"
import { z } from "zod"

export const calendarTimeZone = "Asia/Dhaka"
const dateSchema = z.iso.date()
const timeSchema = z.iso.time({ precision: -1 })

// Calendar days are Dhaka civil dates, never browser-local instants.
export function calendarDate(value: string): TZDate | undefined {
  return dateSchema.safeParse(value).success
    ? new TZDate(`${value}T00:00:00+06:00`, calendarTimeZone)
    : undefined
}

export function calendarDay(date: Date): string {
  const local = new TZDate(date, calendarTimeZone)
  return `${String(local.getFullYear()).padStart(4, "0")}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`
}

export function calendarLabel(value: string, withTime: boolean): string {
  const [day = "", time = ""] = value.split("T")
  const date = calendarDate(day)
  if (!date) return withTime ? "Choose date and time" : "Choose date"
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: calendarTimeZone,
  }).format(date)
  return withTime
    ? `${label} · ${timeSchema.safeParse(time).success ? time : "Choose time"}`
    : label
}
