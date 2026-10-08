"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { reviewFormSchema } from "../schemas"
import { reviewRequest } from "../actions"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { Label } from "@/shared/ui/label"
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

// A conflict preserves the explanation and requires an authoritative record reload.
export function ReviewForm({ id, version }: { id: string; version: number }) {
  const router = useRouter()
  const [message, setMessage] = useState<string>(),
    [blocked, setBlocked] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isReady, isSubmitting },
  } = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { decision: "APPROVE", reason: "" },
  })
  async function submit(values: z.infer<typeof reviewFormSchema>) {
    if (blocked) return
    try {
      const input =
        values.decision === "REJECT"
          ? { version, decision: values.decision, reason: values.reason }
          : { version, decision: values.decision }
      const result = await reviewRequest(id, input)
      if (result.ok) {
        toast.add({ type: "success", title: result.message })
        setBlocked(true)
        router.refresh()
      } else {
        setMessage(result.message)
        toast.add({ type: "error", title: result.message })
        setBlocked(result.conflict === true || result.uncertain === true)
      }
    } catch {
      setBlocked(true)
      setMessage(
        "The review outcome is uncertain. Reload the latest request before continuing."
      )
    }
  }
  return (
    <section className="mt-10 max-w-xl space-y-5 rounded-2xl border p-5">
      <h2 className="font-heading text-xl font-medium">Review request</h2>
      <form
        noValidate
        className="space-y-5"
        onSubmit={(event) => {
          handleSubmit(submit)(event).catch(() =>
            setMessage("The review could not be submitted.")
          )
        }}
      >
        <fieldset
          disabled={!isReady || isSubmitting || blocked}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="decision">Decision</Label>
            <NativeSelect id="decision" {...register("decision")}>
              <NativeSelectOption value="APPROVE">Approve</NativeSelectOption>
              <NativeSelectOption value="REJECT">Reject</NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-reason">Rejection reason</Label>
            <Textarea
              id="review-reason"
              maxLength={500}
              aria-invalid={!!errors.reason}
              aria-describedby={
                errors.reason ? "review-reason-error" : undefined
              }
              {...register("reason")}
            />
            <p className="text-sm text-muted-foreground">
              Required for rejection. Approval does not send this field.
            </p>
            <FormMessage
              id="review-reason-error"
              message={errors.reason?.message}
            />
          </div>
          <Button type="submit">
            {isSubmitting ? "Saving…" : "Save review"}
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
