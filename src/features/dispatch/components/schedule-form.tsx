"use client"
import Link from "next/link"
import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import type { RecordRoute } from "@/shared/lib/routes"
import { queryString } from "@/shared/lib/list-query"
import { dhakaInstant } from "@/features/requests/schemas"
import { assignRequest, rescheduleWork } from "../actions"
import {
  scheduleFormSchema,
  localWindow,
  type VisitWindow,
  type AvailabilityPage,
} from "../schemas"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select"
import { Button } from "@/shared/ui/button"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

export type ScheduleTarget =
  | { kind: "assign"; id: string }
  | { kind: "reschedule"; id: string; version: number }

// Changing a visit invalidates selection. Only a fresh search can authorize choosing again.
export function ScheduleForm({
  target,
  pathname,
  search,
  availability,
}: {
  target: ScheduleTarget
  pathname: RecordRoute
  search: (VisitWindow & { page: number }) | null
  availability: AvailabilityPage | null
}) {
  const router = useRouter(),
    booking = useRef(false)
  const [searchPending, startSearch] = useTransition()
  const [dirty, setDirty] = useState(false),
    [technicianId, setTechnicianId] = useState("")
  const [pending, setPending] = useState(false),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isReady },
  } = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: localWindow(search),
  })
  function changed() {
    setDirty(true)
    setTechnicianId("")
    setMessage(undefined)
  }
  function searchWindow(values: z.infer<typeof scheduleFormSchema>) {
    // Re-searching an unchanged URL must also discard the old selection and read again.
    setDirty(false)
    setTechnicianId("")
    setBlocked(false)
    booking.current = false
    startSearch(() => {
      router.push(
        `${pathname}?${queryString({ start: dhakaInstant(values.startLocal), end: dhakaInstant(values.endLocal), techPage: 1 })}`
      )
      router.refresh()
    })
  }
  async function book() {
    if (
      booking.current ||
      blocked ||
      dirty ||
      !search ||
      !availability?.items.some((item) => item.id === technicianId)
    )
      return
    booking.current = true
    setPending(true)
    setMessage(undefined)
    // Assignment has no version; rescheduling sends the work's version, never the request's.
    const input = { technicianId, start: search.start, end: search.end }
    try {
      const result =
        target.kind === "assign"
          ? await assignRequest(target.id, input)
          : await rescheduleWork(target.id, {
              ...input,
              version: target.version,
            })
      if (result.ok) {
        setBlocked(true)
        toast.add({ type: "success", title: result.message })
        if (result.destination) router.push(result.destination)
        router.refresh()
      } else {
        setMessage(result.message)
        toast.add({ type: "error", title: result.message })
        const mustInspect =
          result.conflict === true || result.uncertain === true
        setBlocked(mustInspect)
        setTechnicianId("")
        booking.current = mustInspect
      }
    } catch {
      setBlocked(true)
      setMessage(
        "The booking outcome is uncertain. Reload the record and availability before choosing again."
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <section className="surface mt-10 max-w-4xl space-y-5 p-6 sm:p-8">
      <h2 className="font-heading text-xl font-medium">
        {target.kind === "assign" ? "Assign a visit" : "Reschedule visit"}
      </h2>
      <p className="text-sm text-muted-foreground">
        Search qualified technicians for a future visit of up to eight hours.
        Availability does not reserve the time.
      </p>
      {target.kind === "reschedule" && (
        <p className="text-sm text-muted-foreground">
          The current booking is included in availability checks. To keep the
          same technician, search outside the current visit window. The agreed
          price stays unchanged.
        </p>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          handleSubmit(searchWindow)(event).catch(() =>
            setMessage("The visit window could not be searched.")
          )
        }}
        className="space-y-5"
      >
        <fieldset
          disabled={!isReady || pending || searchPending}
          className="grid gap-5 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="visit-start">Visit start (Dhaka)</Label>
            <Input
              id="visit-start"
              type="datetime-local"
              step={60}
              {...register("startLocal", { onChange: changed })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-end">Visit end (Dhaka)</Label>
            <Input
              id="visit-end"
              type="datetime-local"
              step={60}
              aria-invalid={!!errors.endLocal}
              aria-describedby={errors.endLocal ? "window-error" : undefined}
              {...register("endLocal", { onChange: changed })}
            />
          </div>
          <Button type="submit" variant="outline">
            {searchPending ? "Searching…" : "Find technicians"}
          </Button>
        </fieldset>
        <FormMessage id="window-error" message={errors.endLocal?.message} />
      </form>
      {!dirty && availability && (
        <div className="space-y-4 border-t pt-5">
          {availability.items.length ? (
            <div className="space-y-2">
              <Label htmlFor="available-technician">Available technician</Label>
              <NativeSelect
                id="available-technician"
                value={technicianId}
                disabled={pending || blocked || searchPending}
                onChange={(event) => setTechnicianId(event.target.value)}
              >
                <NativeSelectOption value="">
                  Choose a technician
                </NativeSelectOption>
                {availability.items.map((item) => (
                  <NativeSelectOption key={item.id} value={item.id}>
                    {item.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          ) : (
            <p>
              No qualified technicians are free in this window. Try another
              time.
            </p>
          )}
          <nav
            aria-label="Technician availability pagination"
            className="flex flex-wrap items-center gap-5 text-sm"
          >
            <p>
              {availability.pagination.total} available · Page{" "}
              {availability.pagination.page} of{" "}
              {Math.max(1, availability.pagination.totalPages)}
            </p>
            {search && availability.pagination.page > 1 && (
              <Link
                className="underline"
                href={`${pathname}?${queryString({ start: search.start, end: search.end, techPage: search.page - 1 })}`}
              >
                Previous technicians
              </Link>
            )}
            {search &&
              availability.pagination.page <
                availability.pagination.totalPages && (
                <Link
                  className="underline"
                  href={`${pathname}?${queryString({ start: search.start, end: search.end, techPage: search.page + 1 })}`}
                >
                  Next technicians
                </Link>
              )}
          </nav>
          <Button
            type="button"
            disabled={!technicianId || pending || blocked || searchPending}
            onClick={() => {
              void book()
            }}
          >
            {pending
              ? "Saving…"
              : target.kind === "assign"
                ? "Confirm assignment"
                : "Confirm reschedule"}
          </Button>
        </div>
      )}
      {dirty && (
        <p className="text-sm text-muted-foreground">
          Find technicians again for the changed visit window.
        </p>
      )}
      <FormMessage message={message} />
      {blocked && (
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reload record and availability
        </Button>
      )}
    </section>
  )
}
