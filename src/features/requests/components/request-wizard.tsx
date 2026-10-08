"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import type { Service } from "@/features/services/schemas"
import { formatMoney, formatDate } from "@/shared/lib/format"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select"
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
    [uncertain, setUncertain] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const {
    register,
    trigger,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
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
    const valid =
      step === 0
        ? await trigger("serviceId")
        : await trigger(["description", "address", "preferredLocal"])
    if (valid) {
      setStep((current) => Math.min(2, current + 1))
      setTimeout(() => heading.current?.focus(), 0)
    }
  }
  async function submit(input: z.infer<typeof wizardSchema>) {
    if (step !== 2 || uncertain) return
    setMessage(undefined)
    try {
      const result = await createRequest({
        serviceId: input.serviceId,
        description: input.description,
        address: input.address,
        preferredStart: dhakaInstant(input.preferredLocal),
      })
      if (result.ok && result.destination) {
        toast.add({ type: "success", title: result.message })
        {
          router.push(result.destination)
          router.refresh()
        }
      } else if (!result.ok) {
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
            className="rounded-xl border p-3 text-sm text-muted-foreground aria-[current=step]:border-primary aria-[current=step]:text-primary"
          >
            {index + 1}. {title}
          </li>
        ))}
      </ol>
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
        <fieldset disabled={isSubmitting} className="space-y-5">
          <div hidden={step !== 0} className="space-y-3">
            <Label htmlFor="serviceId">Service</Label>
            <NativeSelect
              id="serviceId"
              aria-invalid={!!errors.serviceId}
              {...register("serviceId")}
            >
              <NativeSelectOption value="">Choose a service</NativeSelectOption>
              {services.map((service) => (
                <NativeSelectOption key={service.id} value={service.id}>
                  {service.name} · {formatMoney(service.basePriceMinor)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FormMessage message={errors.serviceId?.message} />
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
          <div hidden={step !== 1} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="description">What needs attention?</Label>
              <Textarea
                id="description"
                rows={5}
                maxLength={2000}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FormMessage message={errors.description?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Service address</Label>
              <Textarea
                id="address"
                autoComplete="street-address"
                maxLength={500}
                aria-invalid={!!errors.address}
                {...register("address")}
              />
              <FormMessage message={errors.address?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredLocal">
                Preferred visit time (Dhaka, UTC+06:00)
              </Label>
              <Input
                id="preferredLocal"
                type="datetime-local"
                step={60}
                aria-invalid={!!errors.preferredLocal}
                {...register("preferredLocal")}
              />
              <p className="text-xs text-muted-foreground">
                An administrator confirms the assigned visit schedule after
                review.
              </p>
              <FormMessage message={errors.preferredLocal?.message} />
            </div>
          </div>
          {step === 2 && (
            <dl className="space-y-5 rounded-2xl border bg-muted/30 p-5">
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
                  setStep((current) => current - 1)
                }}
              >
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button
                type="button"
                onClick={() => {
                  void next()
                }}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={uncertain}>
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
    </div>
  )
}
