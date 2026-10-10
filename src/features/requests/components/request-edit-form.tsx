"use client"
import { Card } from "@/shared/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import {
  visitFormSchema,
  dhakaInstant,
  dhakaLocal,
  type ServiceRequest,
} from "../schemas"
import { editRequest } from "../actions"
import { Label } from "@/shared/ui/label"
import { DatePicker } from "@/shared/components/date-picker"
import { Textarea } from "@/shared/ui/textarea"
import { Button } from "@/shared/ui/button"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

export function RequestEditForm({ request }: { request: ServiceRequest }) {
  const router = useRouter(),
    [message, setMessage] = useState<string>(),
    [blocked, setBlocked] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isReady },
  } = useForm<z.infer<typeof visitFormSchema>>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      description: request.description,
      address: request.address,
      preferredLocal: dhakaLocal(request.preferredStart),
    },
  })
  async function submit(input: z.infer<typeof visitFormSchema>) {
    if (blocked) return
    try {
      const result = await editRequest(request.id, {
        version: request.version,
        description: input.description,
        address: input.address,
        preferredStart: dhakaInstant(input.preferredLocal),
      })
      if (result.ok) {
        setMessage(undefined)
        toast.add({ type: "success", title: result.message })
        router.refresh()
      } else {
        setMessage(result.message)
        setBlocked(result.conflict === true || result.uncertain === true)
      }
    } catch {
      setMessage(
        "The outcome could not be confirmed. Reload the request before trying again."
      )
      setBlocked(true)
    }
  }
  return (
    <Card className="mt-10 max-w-4xl border p-6 shadow-none sm:p-8">
      <h2 className="mb-5 font-heading text-xl font-medium">
        Edit pending request
      </h2>
      <form
        onSubmit={(event) => {
          handleSubmit(submit)(event).catch(() =>
            setMessage("The form could not be submitted. Please try again.")
          )
        }}
        className="space-y-5"
        noValidate
      >
        <fieldset
          disabled={!isReady || isSubmitting || blocked}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              maxLength={2000}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "edit-description-error" : undefined
              }
              {...register("description")}
            />
            <FormMessage
              id="edit-description-error"
              message={errors.description?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              maxLength={500}
              aria-invalid={!!errors.address}
              aria-describedby={
                errors.address ? "edit-address-error" : undefined
              }
              {...register("address")}
            />
            <FormMessage
              id="edit-address-error"
              message={errors.address?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-time">
              Preferred visit (Dhaka, UTC+06:00)
            </Label>
            {/* Preserve minute precision and RHF validation focus through the calendar trigger. */}
            <Controller
              name="preferredLocal"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-time"
                  label="Preferred visit (Dhaka, UTC+06:00)"
                  withTime
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={!isReady || isSubmitting || blocked}
                  invalid={!!errors.preferredLocal}
                  describedBy={
                    errors.preferredLocal ? "edit-time-error" : undefined
                  }
                />
              )}
            />
            <FormMessage
              id="edit-time-error"
              message={errors.preferredLocal?.message}
            />
          </div>
          <Button type="submit">
            {isSubmitting ? "Saving…" : "Save request"}
          </Button>
        </fieldset>
        <FormMessage message={message} />
        {blocked && (
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload latest request
          </Button>
        )}
      </form>
    </Card>
  )
}
