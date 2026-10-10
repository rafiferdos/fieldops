"use client"
import { Card } from "@/shared/ui/card"
import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import type { Service } from "@/features/services/schemas"
import { formatMoney, formatDate } from "@/shared/lib/format"
import { Button } from "@/shared/ui/button"
import { DatePicker } from "@/shared/components/date-picker"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { ChoiceSelect } from "@/shared/components/choice-select"
import { FormMessage } from "@/shared/components/form-message"
import { toast } from "@/shared/ui/toast"
import { wizardSchema, dhakaInstant } from "../schemas"
import { createRequest } from "../actions"

const steps = ["Choose a service", "Visit details", "Review request"]
export function RequestWizard({
  services,
  selectedId,
  hasMore,
}: {
  services: Service[]
  selectedId: string | undefined
  hasMore: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(0),
    [message, setMessage] = useState<string>(),
    [uncertain, setUncertain] = useState(false),
    [submitted, setSubmitted] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const advancing = useRef(false),
    submitting = useRef(false)
  const {
    control,
    register,
    trigger,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isReady },
  } = useForm<z.infer<typeof wizardSchema>>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      serviceId: selectedId ?? "",
      description: "",
      address: "",
      preferredLocal: "",
    },
    shouldUnregister: false,
  })
  const values = getValues(),
    selected = services.find((item) => item.id === values.serviceId)
  async function next() {
    if (advancing.current) return
    advancing.current = true
    try {
      const valid =
        step === 0
          ? await trigger("serviceId", { shouldFocus: true })
          : await trigger(["description", "address", "preferredLocal"], {
              shouldFocus: true,
            })
      if (valid) {
        setStep(Math.min(2, step + 1))
        setTimeout(() => heading.current?.focus(), 0)
      }
    } catch {
      setMessage("The visit details could not be validated. Please try again.")
    } finally {
      advancing.current = false
    }
  }
  async function submit(input: z.infer<typeof wizardSchema>) {
    if (step !== 2 || uncertain || submitting.current) return
    submitting.current = true
    setMessage(undefined)
    try {
      const result = await createRequest({
        serviceId: input.serviceId,
        description: input.description,
        address: input.address,
        preferredStart: dhakaInstant(input.preferredLocal),
      })
      if (result.ok && result.destination) {
        setSubmitted(true)
        toast.add({ type: "success", title: result.message })
        router.push(result.destination)
        router.refresh()
      } else if (!result.ok) {
        if (!result.uncertain) submitting.current = false
        setMessage(result.message)
        setUncertain(!result.conflict && result.uncertain === true)
      }
    } catch {
      setMessage(
        "The outcome could not be confirmed. Check My requests before submitting again."
      )
      setUncertain(true)
    }
  }
  return (
    <div className="max-w-3xl">
      <ol aria-label="Request steps" className="mb-8 grid gap-3 sm:grid-cols-3">
        {steps.map((title, index) => (
          <li
            key={title}
            aria-current={step === index ? "step" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-card p-4 text-xs text-muted-foreground transition-colors aria-[current=step]:border-primary/40 aria-[current=step]:bg-primary/5 aria-[current=step]:text-brand-ink",
              index < step && "text-brand-ink"
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
                index <= step &&
                  "border-primary bg-primary text-primary-foreground"
              )}
            >
              {index < step ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : (
                index + 1
              )}
            </span>
            {title}
          </li>
        ))}
      </ol>
      <Card className="border p-6 shadow-none sm:p-8">
        <form
          onSubmit={(event) => {
            handleSubmit(submit)(event).catch(() =>
              setMessage("The form could not be submitted. Please try again.")
            )
          }}
          className="space-y-6"
          noValidate
        >
          <h2
            ref={heading}
            tabIndex={-1}
            className="font-heading text-2xl font-medium outline-none"
          >
            {steps[step]}
          </h2>
          <fieldset disabled={!isReady || isSubmitting} className="space-y-5">
            <div hidden={step !== 0} className="wizard-panel space-y-3">
              <Label htmlFor="serviceId">Service</Label>
              {/* Controlled composition preserves selection and RHF's validation focus. */}
              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <ChoiceSelect
                    id="serviceId"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={!isReady || isSubmitting}
                    invalid={!!errors.serviceId}
                    describedBy={
                      errors.serviceId ? "serviceId-error" : undefined
                    }
                    placeholder="Choose a service"
                    options={services.map((service) => ({
                      value: service.id,
                      label: `${service.name} · ${formatMoney(service.basePriceMinor)}`,
                    }))}
                  />
                )}
              />
              <FormMessage
                id="serviceId-error"
                message={errors.serviceId?.message}
              />
              {hasMore && (
                <p className="text-sm text-muted-foreground">
                  Showing the first 100 services.{" "}
                  <Link href="/services" className="underline">
                    Search the full catalog
                  </Link>{" "}
                  and start from your chosen service.
                </p>
              )}
            </div>
            <div hidden={step !== 1} className="wizard-panel space-y-5">
              <div className="space-y-2">
                <Label htmlFor="description">What needs attention?</Label>
                <Textarea
                  id="description"
                  rows={5}
                  maxLength={2000}
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description ? "description-error" : undefined
                  }
                  {...register("description")}
                />
                <FormMessage
                  id="description-error"
                  message={errors.description?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Service address</Label>
                <Textarea
                  id="address"
                  autoComplete="street-address"
                  maxLength={500}
                  aria-invalid={!!errors.address}
                  aria-describedby={
                    errors.address ? "address-error" : undefined
                  }
                  {...register("address")}
                />
                <FormMessage
                  id="address-error"
                  message={errors.address?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredLocal">
                  Preferred visit time (Dhaka, UTC+06:00)
                </Label>
                {/* Keep the user's civil time unchanged when moving between wizard steps. */}
                <Controller
                  name="preferredLocal"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="preferredLocal"
                      label="Preferred visit time (Dhaka, UTC+06:00)"
                      withTime
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      disabled={!isReady || isSubmitting}
                      invalid={!!errors.preferredLocal}
                      describedBy={
                        errors.preferredLocal
                          ? "preferredLocal-error"
                          : undefined
                      }
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  An administrator confirms the assigned visit schedule after
                  review.
                </p>
                <FormMessage
                  id="preferredLocal-error"
                  message={errors.preferredLocal?.message}
                />
              </div>
            </div>
            {step === 2 && (
              <dl className="wizard-panel space-y-5 rounded-2xl border bg-muted/30 p-5">
                {[
                  ["Service", selected?.name ?? "Selected service"],
                  [
                    "Base price",
                    selected
                      ? formatMoney(selected.basePriceMinor)
                      : "See catalog",
                  ],
                  ["Description", values.description],
                  ["Address", values.address],
                  [
                    "Preferred visit",
                    formatDate(dhakaInstant(values.preferredLocal)),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words whitespace-pre-wrap">
                      {value}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Price confirmation
                  </dt>
                  <dd className="mt-1 text-sm">
                    The assigned visit records the service price; completion
                    generates your invoice.
                  </dd>
                </div>
              </dl>
            )}
            <div className="flex flex-wrap gap-3">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Return keyboard users to the step heading without discarding fields.
                    setStep((current) => current - 1)
                    setTimeout(() => heading.current?.focus(), 0)
                  }}
                >
                  Back
                </Button>
              )}
              {/* Keep distinct elements so Continue cannot become a submit mid-click. */}
              {step < 2 ? (
                <Button
                  key="continue"
                  type="button"
                  onClick={() => {
                    void next()
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  key="submit"
                  type="submit"
                  disabled={uncertain || submitted}
                >
                  {isSubmitting ? "Submitting…" : "Submit request"}
                </Button>
              )}
            </div>
          </fieldset>
          <FormMessage message={message} />
          {uncertain && (
            <Link href="/customer" className="inline-block text-sm underline">
              Check My requests
            </Link>
          )}
        </form>
      </Card>
    </div>
  )
}
