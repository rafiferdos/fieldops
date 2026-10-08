"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { billingSchema, type Billing, type CheckoutIntent } from "../schemas"
import { recoverCheckout, prepareNewAttempt } from "../actions"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

// Once submitted, billing stays frozen until the backend proves the attempt is terminal.
export function CheckoutForm({
  invoiceId,
  intent,
  canReset,
}: {
  invoiceId: string
  intent: CheckoutIntent | null
  canReset: boolean
}) {
  const router = useRouter(),
    [attempted, setAttempted] = useState(!!intent),
    [message, setMessage] = useState<string>(),
    [resetting, startReset] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isReady },
  } = useForm<Billing>({
    resolver: zodResolver(billingSchema),
    defaultValues: intent?.billing ?? { address: "", city: "", postcode: "" },
  })
  function report(message: string) {
    setMessage(message)
    toast.add({ type: "error", title: message })
  }
  async function submit(billing: Billing) {
    setAttempted(true)
    try {
      const result = await recoverCheckout(invoiceId, { billing })
      if (result.ok && result.destination) {
        toast.add({ type: "success", title: result.message })
        router.push(result.destination)
      } else report(result.message)
    } catch {
      report(
        "The checkout response was lost. Recover with the same billing; do not create another charge."
      )
    }
  }
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        handleSubmit(submit)(event).catch(() =>
          report(
            "Checkout could not be submitted. Recover the original attempt before continuing."
          )
        )
      }}
    >
      <fieldset
        disabled={!isReady || isSubmitting || attempted || resetting}
        className="grid gap-5 sm:grid-cols-2"
      >
        {(
          [
            {
              name: "address",
              label: "Billing address",
              complete: "address-line1",
              max: 50,
            },
            {
              name: "city",
              label: "City",
              complete: "address-level2",
              max: 50,
            },
            {
              name: "postcode",
              label: "Postcode",
              complete: "postal-code",
              max: 30,
            },
          ] as const
        ).map((field) => (
          <div
            key={field.name}
            className={
              field.name === "address" ? "space-y-2 sm:col-span-2" : "space-y-2"
            }
          >
            <Label htmlFor={`billing-${field.name}`}>{field.label}</Label>
            <Input
              id={`billing-${field.name}`}
              autoComplete={field.complete}
              maxLength={field.max}
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `billing-${field.name}-error` : undefined
              }
              {...register(field.name)}
            />
            <FormMessage
              id={`billing-${field.name}-error`}
              message={errors[field.name]?.message}
            />
          </div>
        ))}
      </fieldset>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Billing country: Bangladesh.{" "}
        {attempted
          ? "Billing is locked to this intent. Recovery uses its original key and details."
          : "Your profile needs an international phone number. Checkout opens only after this intent is recorded."}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={!isReady || isSubmitting || resetting}>
          {isSubmitting
            ? "Checking checkout…"
            : attempted
              ? "Recover checkout"
              : "Prepare secure checkout"}
        </Button>
        {canReset && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || resetting}
            onClick={() =>
              startReset(async () => {
                try {
                  const result = await prepareNewAttempt(invoiceId)
                  if (result.ok) {
                    toast.add({ type: "success", title: result.message })
                    router.refresh()
                  } else report(result.message)
                } catch {
                  report(
                    "The new attempt could not be prepared. Reload the invoice."
                  )
                }
              })
            }
          >
            {resetting ? "Inspecting…" : "Prepare a new attempt"}
          </Button>
        )}
      </div>
      <FormMessage message={message} />
    </form>
  )
}
