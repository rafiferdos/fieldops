"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { removeService } from "../actions"
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
import { Button } from "@/shared/ui/button"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

// Soft deletion hides the active listing; existing financial and service history survives.
export function RemoveServiceDialog({
  id,
  name,
}: {
  id: string
  name: string
}) {
  const router = useRouter(),
    [open, setOpen] = useState(false),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState<string>(),
    [pending, startTransition] = useTransition()
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next)
      }}
    >
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Remove service
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this service?</AlertDialogTitle>
          <AlertDialogDescription>
            “{name}” will leave the public catalog. Existing requests, work and
            invoice history remain available. There is no restore action in this
            workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormMessage message={message} />
        {blocked && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Inspect latest catalog
          </Button>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep service</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending || blocked}
            onClick={() =>
              startTransition(async () => {
                try {
                  const result = await removeService(id)
                  if (result.ok) {
                    toast.add({ type: "success", title: result.message })
                    setOpen(false)
                    router.refresh()
                  } else {
                    setMessage(result.message)
                    toast.add({ type: "error", title: result.message })
                    setBlocked(!!result.conflict || !!result.uncertain)
                  }
                } catch {
                  setBlocked(true)
                  setMessage(
                    "The removal outcome is uncertain. Inspect the catalog before another write."
                  )
                }
              })
            }
          >
            {pending ? "Removing…" : "Confirm removal"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
