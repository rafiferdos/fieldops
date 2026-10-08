"use client"
import { useState } from "react"
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
    [reason, setReason] = useState(""),
    [message, setMessage] = useState<string>(),
    [pending, setPending] = useState(false),
    [blocked, setBlocked] = useState(false)
  async function submit() {
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
        <div className="space-y-3">
          <Label htmlFor="cancel-reason">Reason for cancellation</Label>
          <Textarea
            id="cancel-reason"
            minLength={3}
            maxLength={500}
            value={reason}
            disabled={pending || blocked}
            onChange={(event) => setReason(event.target.value)}
          />
          <FormMessage message={message} />
          {blocked && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload latest request
            </Button>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep request</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending || blocked || reason.trim().length < 3}
            onClick={() => {
              void submit()
            }}
          >
            {pending ? "Cancelling…" : "Confirm cancellation"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
