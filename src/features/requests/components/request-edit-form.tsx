"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Button } from "@/shared/ui/button"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

export function RequestEditForm({ request }: { request: ServiceRequest }) {
  const router = useRouter(),
    [message, setMessage] = useState<string>(),
    [blocked, setBlocked] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    <section className="mt-10 max-w-2xl border-t pt-8">
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
        <fieldset disabled={isSubmitting || blocked} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              maxLength={2000}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            <FormMessage message={errors.description?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              maxLength={500}
              aria-invalid={!!errors.address}
              {...register("address")}
            />
            <FormMessage message={errors.address?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-time">
              Preferred visit (Dhaka, UTC+06:00)
            </Label>
            <Input
              id="edit-time"
              type="datetime-local"
              step={60}
              aria-invalid={!!errors.preferredLocal}
              {...register("preferredLocal")}
            />
            <FormMessage message={errors.preferredLocal?.message} />
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
    </section>
  )
}
