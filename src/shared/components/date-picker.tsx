"use client"

import { useState, type Ref } from "react"
import { TZDate } from "react-day-picker"
import { CalendarDays } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Label } from "@/shared/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/ui/popover"
import { ChoiceSelect } from "./choice-select"
import {
  calendarDate,
  calendarDay,
  calendarLabel,
  calendarTimeZone,
} from "@/shared/lib/calendar-value"
import { cn } from "@/shared/lib/utils"

type DatePickerProps = {
  id: string
  name?: string
  label: string
  withTime?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string | undefined
  onBlur?: () => void
  ref?: Ref<HTMLButtonElement>
} & (
  | {
      value: string
      onValueChange: (value: string) => void
      defaultValue?: never
    }
  | {
      defaultValue: string
      value?: never
      onValueChange?: (value: string) => void
    }
)

const months = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, month, 1))),
}))
const hours = Array.from({ length: 24 }, (_, value) => ({
  value: String(value).padStart(2, "0"),
  label: String(value).padStart(2, "0"),
}))
const minutes = Array.from({ length: 60 }, (_, value) => ({
  value: String(value).padStart(2, "0"),
  label: String(value).padStart(2, "0"),
}))

// One accessible shadcn composition serves controlled forms and bookmarkable GET filters.
export function DatePicker({
  id,
  name,
  label,
  withTime = false,
  disabled,
  invalid,
  describedBy,
  onBlur,
  ref,
  value,
  defaultValue,
  onValueChange,
}: DatePickerProps) {
  const [stored, setStored] = useState(defaultValue ?? "")
  const selection = value ?? stored
  const [day = "", time = ""] = selection.split("T")
  const [hour = "", minute = ""] = time.split(":")
  const selected = calendarDate(day)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(
    () => selected ?? new TZDate(Date.now(), calendarTimeZone)
  )
  const [currentYear] = useState(() =>
    new TZDate(Date.now(), calendarTimeZone).getFullYear()
  )
  const firstYear = 1900
  const lastYear = currentYear + 100
  const years = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => ({
      value: String(firstYear + index),
      label: String(firstYear + index),
    })
  )
  // An unusual URL date remains editable without rendering thousands of year options.
  if (month.getFullYear() < firstYear || month.getFullYear() > lastYear) {
    years.push({
      value: String(month.getFullYear()),
      label: String(month.getFullYear()),
    })
    years.sort((a, b) => Number(a.value) - Number(b.value))
  }

  function change(next: string) {
    if (value === undefined) setStored(next)
    onValueChange?.(next)
  }

  return (
    <div className="min-w-0" data-date-picker="" data-date-value={selection}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={selection}
          disabled={disabled}
        />
      )}
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next)
            setMonth(selected ?? new TZDate(Date.now(), calendarTimeZone))
          else onBlur?.()
          setOpen(next)
        }}
      >
        <PopoverTrigger
          render={<Button variant="outline" />}
          id={id}
          ref={ref}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onBlur={onBlur}
          className={cn(
            "h-10 w-full justify-between gap-3 border-transparent bg-input/50 text-left font-normal dark:bg-input/50",
            !selected && "text-muted-foreground"
          )}
        >
          <span className="min-w-0 truncate">
            {calendarLabel(selection, withTime)}
          </span>
          <CalendarDays
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          aria-label={label}
          className="w-72 max-w-[calc(100vw-1rem)] gap-3 p-3 motion-reduce:animate-none"
          initialFocus={false}
        >
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <div className="grid grid-cols-[1.3fr_1fr] gap-2">
            <div>
              <Label htmlFor={`${id}-month`} className="sr-only">
                Month
              </Label>
              <ChoiceSelect
                id={`${id}-month`}
                value={String(month.getMonth())}
                options={months}
                onValueChange={(next) =>
                  setMonth(
                    new TZDate(
                      month.getFullYear(),
                      Number(next),
                      1,
                      calendarTimeZone
                    )
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor={`${id}-year`} className="sr-only">
                Year
              </Label>
              <ChoiceSelect
                id={`${id}-year`}
                value={String(month.getFullYear())}
                options={years}
                onValueChange={(next) =>
                  setMonth(
                    new TZDate(
                      Number(next),
                      month.getMonth(),
                      1,
                      calendarTimeZone
                    )
                  )
                }
              />
            </div>
          </div>
          <Calendar
            mode="single"
            required
            selected={selected}
            month={month}
            onMonthChange={(next) =>
              setMonth(new TZDate(next, calendarTimeZone))
            }
            timeZone={calendarTimeZone}
            hideNavigation
            autoFocus
            captionLayout="label"
            className="w-full p-0 [--cell-size:2.25rem]"
            classNames={{ month_caption: "sr-only", root: "w-full" }}
            onSelect={(next) => {
              const nextDay = calendarDay(next)
              change(withTime ? `${nextDay}T${hour}:${minute}` : nextDay)
              if (!withTime) setOpen(false)
            }}
          />
          {withTime && (
            <div className="grid grid-cols-2 gap-2 border-t pt-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${id}-hour`}>Hour</Label>
                <ChoiceSelect
                  id={`${id}-hour`}
                  value={hour}
                  options={hours}
                  disabled={!selected}
                  placeholder="HH"
                  onValueChange={(next) => change(`${day}T${next}:${minute}`)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${id}-minute`}>Minute</Label>
                <ChoiceSelect
                  id={`${id}-minute`}
                  value={minute}
                  options={minutes}
                  disabled={!selected}
                  placeholder="MM"
                  onValueChange={(next) => change(`${day}T${hour}:${next}`)}
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                Dhaka time · UTC+06:00 · 24-hour clock
              </p>
            </div>
          )}
          <div className="flex justify-between gap-2 border-t pt-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                change("")
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
