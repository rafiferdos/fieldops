"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { feedbackFormSchema } from "../schemas"
import { inspectFeedback, submitFeedback } from "../actions"
import { Card } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { toast } from "@/shared/ui/toast"
import { PeekRating } from "@/shared/components/react-bits/peek-rating"
import { FormMessage } from "@/shared/components/form-message"

// Preserve the customer's explanation after a lost response; inspect instead of replaying.
export function FeedbackForm({ workOrderId }: { workOrderId: string }) {
  const router = useRouter(),
    [blocked, setBlocked] = useState(false),
    [submitted, setSubmitted] = useState(false),
    [message, setMessage] = useState<string>(),
    [inspecting, startInspection] = useTransition()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isReady, isSubmitting },
  } = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { rating: "5", comment: "" },
  })
  function report(message: string) {
    setMessage(message)
    toast.add({ type: "error", title: message })
  }
  async function submit(values: z.infer<typeof feedbackFormSchema>) {
    if (blocked) return
    try {
      const result = await submitFeedback(workOrderId, {
        rating: Number(values.rating),
        ...(values.comment ? { comment: values.comment } : {}),
      })
      if (result.ok) {
        setSubmitted(true)
        toast.add({ type: "success", title: result.message })
        router.refresh()
      } else {
        setBlocked(!!result.uncertain || !!result.conflict)
        report(result.message)
      }
    } catch {
      setBlocked(true)
      report(
        "The feedback outcome is uncertain. Inspect the latest work before submitting again."
      )
    }
  }
  if (submitted)
    return (
      <Card className="mt-8 max-w-3xl p-6">
        <p role="status">Your feedback is recorded. Thank you.</p>
      </Card>
    )
  return (
    <Card className="mt-8 max-w-3xl border p-6 shadow-none sm:p-8">
      <h2 className="font-heading text-2xl font-medium">
        How was your service?
      </h2>
      <p className="text-sm text-muted-foreground">
        One review per completed, paid visit. Submitted feedback cannot be
        edited.
      </p>
      <form
        noValidate
        className="space-y-5"
        onSubmit={(event) => {
          handleSubmit(submit)(event).catch(() =>
            report("Feedback could not be submitted.")
          )
        }}
      >
        <fieldset
          disabled={!isReady || isSubmitting || blocked || inspecting}
          className="space-y-5"
        >
          <div className="max-w-xs space-y-2">
            <p className="text-sm font-medium">Rating</p>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <PeekRating
                  value={Number(field.value)}
                  onChange={(rating) => field.onChange(String(rating))}
                  onBlur={field.onBlur}
                  focusRef={field.ref}
                  disabled={!isReady || isSubmitting || blocked || inspecting}
                  invalid={!!errors.rating}
                  {...(errors.rating
                    ? { describedBy: "feedback-rating-error" }
                    : {})}
                />
              )}
            />
            <FormMessage
              id="feedback-rating-error"
              message={errors.rating?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-comment">Comment (optional)</Label>
            <Textarea
              id="feedback-comment"
              maxLength={1000}
              aria-invalid={!!errors.comment}
              aria-describedby={
                errors.comment ? "feedback-comment-error" : undefined
              }
              {...register("comment")}
            />
            <FormMessage
              id="feedback-comment-error"
              message={errors.comment?.message}
            />
          </div>
          <Button type="submit">
            {isSubmitting ? "Submitting…" : "Submit feedback"}
          </Button>
        </fieldset>
        <FormMessage message={message} />
        {blocked && (
          <Button
            type="button"
            variant="outline"
            disabled={inspecting}
            onClick={() =>
              startInspection(async () => {
                try {
                  const result = await inspectFeedback(workOrderId)
                  if (result.ok) {
                    setSubmitted(!!result.submitted)
                    setBlocked(!result.eligible)
                    setMessage(undefined)
                    toast.add({ type: "info", title: result.message })
                    router.refresh()
                  } else report(result.message)
                } catch {
                  report("The latest feedback state could not be inspected.")
                }
              })
            }
          >
            {inspecting ? "Inspecting…" : "Inspect latest feedback"}
          </Button>
        )}
      </form>
    </Card>
  )
}
