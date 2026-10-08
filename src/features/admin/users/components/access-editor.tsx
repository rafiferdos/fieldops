"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import {
  accessFormSchema,
  type ManagedUser,
  type ManagedUsersQuery,
} from "../schemas"
import { updateManagedAccess } from "../actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import { Label } from "@/shared/ui/label"
import { toast } from "@/shared/ui/toast"
import { ChoiceSelect } from "@/shared/components/choice-select"
import { FormMessage } from "@/shared/components/form-message"

export function AccessEditor({
  user,
  query,
  ownAccount,
}: {
  user: ManagedUser
  query: ManagedUsersQuery
  ownAccount: boolean
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false)
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!busy) setOpen(next)
      }}
    >
      <SheetTrigger render={<Button variant="outline" />}>
        Manage access
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage account access</SheetTitle>
          <SheetDescription>
            {user.name} · {user.email}
          </SheetDescription>
        </SheetHeader>
        {open && (
          <AccessForm
            user={user}
            query={query}
            ownAccount={ownAccount}
            blocked={blocked}
            onBlocked={setBlocked}
            onBusy={setBusy}
            onSaved={() => setOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function AccessForm({
  user,
  query,
  ownAccount,
  blocked,
  onBlocked,
  onBusy,
  onSaved,
}: {
  user: ManagedUser
  query: ManagedUsersQuery
  ownAccount: boolean
  blocked: boolean
  onBlocked: (value: boolean) => void
  onBusy: (value: boolean) => void
  onSaved: () => void
}) {
  const router = useRouter(),
    [reviewed, setReviewed] = useState<z.infer<typeof accessFormSchema> | null>(
      null
    ),
    [message, setMessage] = useState<string>(),
    [pending, startTransition] = useTransition()
  const {
    control,
    handleSubmit,
    formState: { isReady },
  } = useForm<z.infer<typeof accessFormSchema>>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: { role: user.role, status: user.status },
  })
  function report(value: string) {
    setMessage(value)
    toast.add({ type: "error", title: value })
  }
  function review(values: z.infer<typeof accessFormSchema>) {
    if (blocked) return
    if (values.role === user.role && values.status === user.status) {
      report("Choose a role or status that differs from the current account.")
      return
    }
    setMessage(undefined)
    setReviewed(values)
  }
  // Confirmation commits only the reviewed changes; conflicts and lost responses require inspection.
  function confirm() {
    if (!reviewed || blocked || pending) return
    onBusy(true)
    startTransition(async () => {
      try {
        const result = await updateManagedAccess(
          user.id,
          {
            role: user.role,
            status: user.status,
            updatedAt: user.updatedAt,
          },
          query,
          {
            ...(reviewed.role !== user.role ? { role: reviewed.role } : {}),
            ...(reviewed.status !== user.status
              ? { status: reviewed.status }
              : {}),
          }
        )
        setReviewed(null)
        if (result.ok) {
          toast.add({ type: "success", title: result.message })
          onSaved()
          if (result.destination) router.replace(result.destination)
          else router.refresh()
        } else {
          onBlocked(!!result.conflict || !!result.uncertain)
          report(result.message)
        }
      } catch {
        setReviewed(null)
        onBlocked(true)
        report(
          "The access outcome is uncertain. Inspect the latest directory before another change."
        )
      } finally {
        onBusy(false)
      }
    })
  }
  return (
    <>
      <form
        noValidate
        className="space-y-5 p-5"
        onSubmit={(event) => {
          handleSubmit(review)(event).catch(() =>
            report("Check the account access selections.")
          )
        }}
      >
        <fieldset
          disabled={!isReady || pending || blocked}
          className="space-y-5"
        >
          {(["role", "status"] as const).map((name) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={`access-${name}`}>
                {name === "role" ? "Primary role" : "Account status"}
              </Label>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <ChoiceSelect
                    id={`access-${name}`}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={!isReady || pending || blocked}
                    options={
                      name === "role"
                        ? [
                            { value: "CUSTOMER", label: "Customer" },
                            { value: "TECHNICIAN", label: "Technician" },
                            { value: "ADMIN", label: "Administrator" },
                          ]
                        : [
                            { value: "ACTIVE", label: "Active" },
                            { value: "SUSPENDED", label: "Suspended" },
                          ]
                    }
                  />
                )}
              />
            </div>
          ))}
          <Button type="submit">Review access change</Button>
        </fieldset>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Changes revoke existing sessions. Reactivation requires a fresh
          sign-in. Leaving the technician role removes its skills; active work
          must first be reassigned. Suspension retains assignments.
        </p>
        {ownAccount && (
          <p className="text-sm font-medium">
            This is your account. Changing access signs you out.
          </p>
        )}
        <FormMessage
          message={
            message ??
            (blocked
              ? "Inspect the latest directory before another change."
              : undefined)
          }
        />
        {blocked && (
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Inspect latest directory
          </Button>
        )}
      </form>
      <AlertDialog
        open={!!reviewed}
        onOpenChange={(next) => {
          if (!next && !pending) setReviewed(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm access change?</AlertDialogTitle>
            <AlertDialogDescription>
              For {user.email}: {user.role} → {reviewed?.role}, {user.status} →{" "}
              {reviewed?.status}. Existing sessions will be revoked.{" "}
              {ownAccount
                ? "This change signs you out."
                : "The user must sign in again."}{" "}
              The backend protects the last active administrator and active
              technician work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              Keep current access
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={pending || blocked}
              onClick={confirm}
            >
              {pending ? "Updating…" : "Confirm access change"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
