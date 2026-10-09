"use client"

import { useRef, useState, type RefObject } from "react"
import { LogOut, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { HoldButton } from "@/shared/components/react-bits/hold-button"
import { FormMessage } from "@/shared/components/form-message"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/shared/ui/dialog"
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
  const cancel = useRef<HTMLButtonElement>(null)
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
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          onOpenChange(value)
          setMessage(undefined)
        }
      }}
    >
      <DialogContent
        finalFocus={returnFocus}
        initialFocus={cancel}
        showCloseButton={false}
      >
        {/* The close control is the safe initial focus; hold is always an explicit gesture. */}
        <DialogClose
          disabled={pending}
          render={
            <Button
              ref={cancel}
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 size-11"
              aria-label="Cancel sign out"
            />
          }
        >
          <X aria-hidden="true" />
        </DialogClose>
        <DialogHeader className="pr-9">
          <DialogTitle>Sign out of FieldOps?</DialogTitle>
          <DialogDescription>
            Your saved requests and visits will remain in your account. You will
            need to sign in again to access your workspace.
          </DialogDescription>
        </DialogHeader>
        <FormMessage message={message} />
        <div className="space-y-3">
          <HoldButton
            ariaLabel={pending ? "Signing out…" : "Hold to logout"}
            disabled={pending}
            onHold={() => {
              void submit()
            }}
          >
            <span className="hold-button__icon">
              <LogOut aria-hidden="true" className="size-4" />
            </span>
            {pending ? "Signing out…" : "Hold to logout"}
          </HoldButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
