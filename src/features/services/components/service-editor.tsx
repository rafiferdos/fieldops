"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import type { Service } from "../schemas"
import {
  priceFromMinor,
  priceToMinor,
  serviceFormSchema,
} from "../management-schemas"
import { createService, updateService } from "../actions"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Label } from "@/shared/ui/label"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

export function ServiceEditor({ service }: { service?: Service }) {
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
      <SheetTrigger
        render={<Button variant={service ? "outline" : "default"} />}
      >
        {service ? "Edit service" : "Create service"}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{service ? "Edit service" : "Create service"}</SheetTitle>
          <SheetDescription>
            BDT prices apply to future assignments. Existing work and invoice
            amounts remain unchanged.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <ServiceForm
            service={service}
            onBusy={setBusy}
            blocked={blocked}
            onBlocked={setBlocked}
            onSaved={() => setOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
function ServiceForm({
  service,
  onBusy,
  onSaved,
  blocked,
  onBlocked: setBlocked,
}: {
  service: Service | undefined
  onBusy: (value: boolean) => void
  onSaved: () => void
  blocked: boolean
  onBlocked: (value: boolean) => void
}) {
  const router = useRouter(),
    [message, setMessage] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isReady, isSubmitting },
  } = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      price: service ? priceFromMinor(service.basePriceMinor) : "",
    },
  })
  function report(message: string) {
    setMessage(message)
    toast.add({ type: "error", title: message })
  }
  async function submit(values: z.infer<typeof serviceFormSchema>) {
    if (blocked) return
    const basePriceMinor = priceToMinor(values.price)
    if (basePriceMinor === null) {
      report("Check the BDT price.")
      return
    }
    onBusy(true)
    try {
      // Send only changed fields; never overwrite unrelated catalog details unnecessarily.
      const result = service
        ? await updateService(service.id, service.updatedAt, {
            ...(values.name !== service.name ? { name: values.name } : {}),
            ...(values.description !== service.description
              ? { description: values.description }
              : {}),
            ...(basePriceMinor !== service.basePriceMinor
              ? { basePriceMinor }
              : {}),
          })
        : await createService({
            name: values.name,
            description: values.description,
            basePriceMinor,
          })
      if (result.ok) {
        toast.add({ type: "success", title: result.message })
        onSaved()
        router.refresh()
      } else {
        setBlocked(!!result.conflict || !!result.uncertain)
        report(result.message)
      }
    } catch {
      setBlocked(true)
      report(
        "The catalog outcome is uncertain. Inspect the latest catalog before another write."
      )
    } finally {
      onBusy(false)
    }
  }
  return (
    <form
      noValidate
      className="space-y-5 p-5"
      onSubmit={(event) => {
        handleSubmit(submit)(event).catch(() =>
          report("The catalog form could not be submitted.")
        )
      }}
    >
      <fieldset
        disabled={!isReady || isSubmitting || blocked}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="catalog-name">Service name</Label>
          <Input
            id="catalog-name"
            maxLength={100}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "catalog-name-error" : undefined}
            {...register("name")}
          />
          <FormMessage id="catalog-name-error" message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="catalog-description">Description</Label>
          <Textarea
            id="catalog-description"
            rows={6}
            maxLength={2000}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "catalog-description-error" : undefined
            }
            {...register("description")}
          />
          <FormMessage
            id="catalog-description-error"
            message={errors.description?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="catalog-price">Base price (BDT)</Label>
          <Input
            id="catalog-price"
            inputMode="decimal"
            maxLength={12}
            placeholder="1500.00"
            aria-invalid={!!errors.price}
            aria-describedby={
              errors.price ? "catalog-price-error" : "catalog-price-help"
            }
            {...register("price")}
          />
          <p id="catalog-price-help" className="text-xs text-muted-foreground">
            Up to two decimal places. SSLCommerz checkout supports invoices from
            BDT 10 to BDT 500,000.
          </p>
          <FormMessage
            id="catalog-price-error"
            message={errors.price?.message}
          />
        </div>
        <Button type="submit">
          {isSubmitting
            ? "Saving…"
            : service
              ? "Save changes"
              : "Publish service"}
        </Button>
      </fieldset>
      <FormMessage
        message={
          message ??
          (blocked
            ? "Inspect the latest catalog before another write."
            : undefined)
        }
      />
      {blocked && (
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Inspect latest catalog
        </Button>
      )}
    </form>
  )
}
