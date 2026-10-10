"use client"

import { useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { ButtonLink } from "@/shared/components/button-link"
import { FormMessage } from "@/shared/components/form-message"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog"
import type { Role } from "../schemas"

// Demo accounts use real API records; the notice must not promise fake data or unavailable capabilities.
export function DemoLoginDialog({
  role,
  pending,
  message,
  onClose,
  onConfirm,
}: {
  role: Role | null
  pending: boolean
  message: string | undefined
  onClose: () => void
  onConfirm: () => void
}) {
  const cancel = useRef<HTMLButtonElement>(null)
  const label =
    role === "ADMIN"
      ? "admin"
      : role === "TECHNICIAN"
        ? "technician"
        : "customer"
  return (
    <Dialog
      open={role !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent showCloseButton={false} initialFocus={cancel}>
        <DialogClose
          disabled={pending}
          render={
            <Button
              ref={cancel}
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 size-11"
              aria-label="Cancel demo sign in"
            />
          }
        >
          <X aria-hidden="true" />
        </DialogClose>
        <DialogHeader className="pr-9">
          <DialogTitle>Before you explore the {label} demo</DialogTitle>
          <DialogDescription>
            This shared account is for demonstration and evaluation. Its records
            are demo activity stored through the real FieldOps API, and changes
            may be visible to other visitors. Please do not enter personal
            information or request a real service.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Create your own customer account to manage your personal requests,
          profile and service history. Demo sign-in lets you explore the
          available features for the selected role; it does not book a real
          technician.
        </p>
        <FormMessage message={message} />
        <DialogFooter>
          <ButtonLink
            href="/register"
            variant="outline"
            aria-disabled={pending}
            onClick={(event) => {
              if (pending) event.preventDefault()
            }}
          >
            Create an account
          </ButtonLink>
          <Button disabled={pending} onClick={onConfirm}>
            {pending ? "Signing in…" : `Continue to ${label} demo`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
