"use client"

import { useState, type RefObject } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { FormMessage } from "@/shared/components/form-message"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog"
import { signOut } from "../actions"

export function SignOutDialog({
  open,
  onOpenChange,
  returnFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocus?: RefObject<HTMLButtonElement | null>
}) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  async function submit() {
    if (pending) return
    setPending(true)
    try {
      const result = await signOut()
      if (result.ok) {
        // A document navigation also discards private query caches and in-flight reads.
        window.location.replace("/login")
      } else {
        setMessage(result.message)
        setPending(false)
      }
    } catch {
      setMessage("Sign-out could not be confirmed. Please try again.")
      setPending(false)
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          onOpenChange(value)
          setMessage(undefined)
        }
      }}
    >
      <AlertDialogContent finalFocus={returnFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of FieldOps?</AlertDialogTitle>
          <AlertDialogDescription>
            Your saved requests and visits will remain in your account. You will
            need to sign in again to access your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormMessage message={message} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            Stay signed in
          </AlertDialogCancel>
          <Button
            disabled={pending}
            onClick={() => {
              void submit()
            }}
          >
            <LogOut aria-hidden="true" />
            {pending ? "Signing out…" : "Confirm sign out"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
