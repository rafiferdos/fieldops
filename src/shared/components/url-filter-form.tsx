"use client"

import { Suspense, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { ChoiceSelect } from "./choice-select"
import { DatePicker } from "./date-picker"
import { FormMessage } from "./form-message"
import { ButtonLink } from "./button-link"
import { queryString } from "@/shared/lib/list-query"
import type { ListRoute } from "@/shared/lib/routes"

type FilterField = {
  name: string
  label: string
  placeholder?: string
  maxLength?: number
} & (
  | { kind: "text" }
  | { kind: "date" }
  | { kind: "select"; options: readonly { value: string; label: string }[] }
)
interface FilterProps {
  pathname: ListRoute | "/admin"
  values: Record<string, string>
  schema: z.ZodType<Record<string, string>, Record<string, string>>
  fields: readonly FilterField[]
  preserved?: Record<string, string | number | undefined>
  submitLabel?: string
  clearLabel?: string
}

// A small client boundary preserves server-owned reads and validates only explicit filter fields.
export function UrlFilterForm(props: FilterProps) {
  return (
    <Card className="mb-8 border p-5 shadow-none">
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <FilterFields {...props} />
      </Suspense>
    </Card>
  )
}

function FilterFields({
  pathname,
  values,
  schema,
  fields,
  preserved = {},
  submitLabel = "Apply filters",
  clearLabel = "Clear filters",
}: FilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  // Remount on URL identity so Back/Forward also restores controlled fields and errors.
  return (
    <FilterInputs
      key={`${pathname}?${searchParams.toString()}`}
      {...{
        pathname,
        values,
        schema,
        fields,
        preserved,
        submitLabel,
        clearLabel,
        pending,
      }}
      onApply={(next) =>
        startTransition(() =>
          router.push(`${pathname}?${queryString({ ...preserved, ...next })}`, {
            scroll: false,
          })
        )
      }
    />
  )
}

function FilterInputs({
  pathname,
  values,
  schema,
  fields,
  preserved,
  submitLabel,
  clearLabel,
  pending,
  onApply,
}: FilterProps & {
  pending: boolean
  onApply: (values: Record<string, string>) => void
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues: values,
  })
  // Restored Next.js route segments may retain dirty form state; reactivation restores the URL snapshot.
  useEffect(() => reset(values), [reset, values])
  return (
    <form
      action={pathname}
      noValidate
      onSubmit={(event) => {
        handleSubmit(onApply)(event).catch(() =>
          setError("root", {
            message: "Filters could not be applied. Please try again.",
          })
        )
      }}
      className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <fieldset disabled={pending} className="contents">
        {fields.map((field) => {
          const id = `filter-${field.name}`
          const message = errors[field.name]?.message
          return (
            <div key={field.name} className="min-w-0 space-y-2">
              <Label htmlFor={id}>{field.label}</Label>
              {field.kind === "text" ? (
                <Input
                  id={id}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  aria-invalid={!!message}
                  aria-describedby={message ? `${id}-error` : undefined}
                  {...register(field.name)}
                />
              ) : (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: input }) =>
                    field.kind === "date" ? (
                      <DatePicker
                        id={id}
                        label={field.label}
                        name={input.name}
                        value={input.value ?? ""}
                        onValueChange={input.onChange}
                        onBlur={input.onBlur}
                        ref={input.ref}
                        disabled={pending}
                        invalid={!!message}
                        describedBy={message ? `${id}-error` : undefined}
                      />
                    ) : (
                      <ChoiceSelect
                        id={id}
                        name={input.name}
                        value={input.value ?? ""}
                        onValueChange={input.onChange}
                        onBlur={input.onBlur}
                        ref={input.ref}
                        options={field.options}
                        disabled={pending}
                        invalid={!!message}
                        describedBy={message ? `${id}-error` : undefined}
                      />
                    )
                  }
                />
              )}
              <FormMessage id={`${id}-error`} message={message} />
            </div>
          )
        })}
        {Object.entries(preserved ?? {}).map(([name, value]) =>
          value === undefined ? null : (
            <input key={name} type="hidden" name={name} value={value} />
          )
        )}
        <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Applying…" : submitLabel}
          </Button>
          <ButtonLink href={pathname} variant="ghost">
            {clearLabel}
          </ButtonLink>
        </div>
        <FormMessage message={errors.root?.message} />
      </fieldset>
    </form>
  )
}
