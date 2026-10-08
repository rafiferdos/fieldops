"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import {
  advanceWork,
  completeWork,
  inspectWork,
  type WorkActionResult,
} from "../actions"
import { reportFormSchema, type WorkOrder } from "../schemas"
import { nextWorkStatus } from "../status"
import { Button } from "@/shared/ui/button"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

// Retain the report during inspection; a confirmed completion never offers another write.
export function WorkActions({
  work,
}: {
  work: Pick<WorkOrder, "id" | "version" | "status"> & {
    request: Pick<WorkOrder["request"], "status">
  }
}) {
  const router = useRouter(),
    running = useRef(false)
  const [current, setCurrent] = useState(work),
    [busy, setBusy] = useState(false)
  const [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isReady, isSubmitting },
  } = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { report: "" },
  })
  async function run(operation: () => Promise<WorkActionResult>) {
    if (running.current) return
    running.current = true
    setBusy(true)
    try {
      const result = await operation()
      if (result.ok) {
        setCurrent(result.work)
        setBlocked(false)
        setMessage(undefined)
        toast.add({ type: "success", title: result.message })
        router.refresh()
      } else {
        setMessage(result.message)
        setBlocked(true)
        toast.add({ type: "error", title: result.message })
      }
    } catch {
      setMessage(
        "The outcome is uncertain. Inspect latest work before taking another action."
      )
      setBlocked(true)
    } finally {
      running.current = false
      setBusy(false)
    }
  }
  const next =
    current.request.status === "APPROVED"
      ? nextWorkStatus(current.status)
      : null
  return (
    <section className="surface mt-10 max-w-4xl space-y-5 p-6 sm:p-8">
      <h2 className="font-heading text-xl font-medium">Visit actions</h2>
      <p className="text-sm">
        Current work state: <strong>{current.status}</strong>
      </p>
      {next && (
        <Button
          type="button"
          disabled={busy || blocked}
          onClick={() => {
            if (!blocked)
              void run(() =>
                advanceWork(current.id, {
                  version: current.version,
                  status: next,
                })
              )
          }}
        >
          {busy
            ? "Updating…"
            : next === "EN_ROUTE"
              ? "Start travelling"
              : "Start work"}
        </Button>
      )}
      {current.status === "IN_PROGRESS" &&
        current.request.status === "APPROVED" && (
          <form
            noValidate
            className="space-y-4"
            onSubmit={(event) => {
              handleSubmit((values) => {
                if (!blocked)
                  return run(() =>
                    completeWork(current.id, {
                      version: current.version,
                      report: values.report,
                    })
                  )
              })(event).catch(() =>
                setMessage("The completion report could not be submitted.")
              )
            }}
          >
            <fieldset
              disabled={!isReady || busy || isSubmitting || blocked}
              className="space-y-4"
            >
              <Label htmlFor="completion-report">Completion report</Label>
              <Textarea
                id="completion-report"
                rows={6}
                maxLength={2000}
                aria-invalid={!!errors.report}
                aria-describedby={
                  errors.report ? "report-error" : "completion-help"
                }
                {...register("report")}
              />
              <p id="completion-help" className="text-sm text-muted-foreground">
                Describe the completed service in 10–2000 characters. Completion
                freezes the report and issues the invoice.
              </p>
              <FormMessage id="report-error" message={errors.report?.message} />
              <Button type="submit">
                {busy ? "Completing…" : "Complete work and issue invoice"}
              </Button>
            </fieldset>
          </form>
        )}
      {current.status === "COMPLETED" && (
        <p>Completion is confirmed. The report and invoice are read-only.</p>
      )}
      {current.status === "CANCELLED" && (
        <p>This visit has been cancelled. No execution action is available.</p>
      )}
      <FormMessage message={message} />
      {blocked && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your report is retained here. Inspect the current work and invoice
            before deciding whether another action is needed.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              void run(() => inspectWork(current.id))
            }}
          >
            {busy ? "Checking…" : "Inspect latest work"}
          </Button>
        </div>
      )}
    </section>
  )
}
