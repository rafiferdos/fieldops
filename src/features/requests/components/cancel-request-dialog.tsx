"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cancelRequestSchema } from "../schemas"
import { useRouter } from "next/navigation"
import { cancelRequest } from "../actions"
import { Button } from "@/shared/ui/button"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { FormMessage } from "@/shared/components/form-message"
import { toast } from "@/shared/ui/toast"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog"

export function CancelRequestDialog({
  id,
  version,
}: {
  id: string
  version: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState<string>(),
    [pending, setPending] = useState(false),
    [blocked, setBlocked] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ reason: string }>({
    resolver: zodResolver(cancelRequestSchema.omit({ version: true })),
    defaultValues: { reason: "" },
  })
  // The destructive action shares the server's reason constraints and never retries uncertain writes.
  async function submit({ reason }: { reason: string }) {
    if (pending || blocked) return
    setPending(true)
    try {
      const result = await cancelRequest(id, { version, reason })
      if (result.ok) {
        toast.add({ type: "success", title: result.message })
        setOpen(false)
        router.refresh()
      } else {
        setMessage(result.message)
        setBlocked(result.conflict === true || result.uncertain === true)
      }
    } catch {
      setMessage(
        "The outcome could not be confirmed. Reload before trying again."
      )
      setBlocked(true)
    } finally {
      setPending(false)
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) setOpen(value)
      }}
    >
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Cancel request
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this service request?</AlertDialogTitle>
          <AlertDialogDescription>
            Eligible assigned work will also be cancelled. You cannot undo this
            action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(event) => {
            handleSubmit(submit)(event).catch(() =>
              setMessage(
                "Cancellation could not be confirmed. Reload before trying again."
              )
            )
          }}
          noValidate
          className="space-y-6"
        >
          <div className="space-y-3">
            <Label htmlFor="cancel-reason">Reason for cancellation</Label>
            <Textarea
              id="cancel-reason"
              minLength={3}
              maxLength={500}
              disabled={pending || blocked}
              aria-invalid={!!errors.reason}
              aria-describedby={
                errors.reason ? "cancel-reason-error" : undefined
              }
              {...register("reason")}
            />
            <FormMessage
              id="cancel-reason-error"
              message={errors.reason?.message}
            />
            <FormMessage message={message} />
            {blocked && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload latest request
              </Button>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              Keep request
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending || blocked}
            >
              {pending ? "Cancelling…" : "Confirm cancellation"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
