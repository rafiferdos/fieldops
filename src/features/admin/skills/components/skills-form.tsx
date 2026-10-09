"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { loadSkillOptions, replaceTechnicianSkills } from "../actions"
import {
  skillsFormSchema,
  sameSkills,
  type TechnicianSkills,
  type SkillOption,
} from "../schemas"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { Badge } from "@/shared/ui/badge"
import { toast } from "@/shared/ui/toast"
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

export function SkillsForm({
  snapshot,
  initialOptions,
  pages,
  onBusy,
  onInspect,
  onSaved,
}: {
  snapshot: TechnicianSkills
  initialOptions: SkillOption[]
  pages: number
  onBusy: (busy: boolean) => void
  onInspect: () => void
  onSaved: () => void
}) {
  const [options, setOptions] = useState(() => [
      ...new Map(
        [...snapshot.services, ...initialOptions].map((option) => [
          option.id,
          option,
        ])
      ).values(),
    ]),
    [page, setPage] = useState(1),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState<string>(),
    [reviewed, setReviewed] = useState<string[] | null>(null),
    [pending, startTransition] = useTransition(),
    [loading, startLoading] = useTransition()
  const {
    control,
    handleSubmit,
    formState: { errors, isReady },
  } = useForm<z.infer<typeof skillsFormSchema>>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: { serviceIds: snapshot.serviceIds },
  })
  function report(value: string) {
    setMessage(value)
    toast.add({ type: "error", title: value })
  }
  function review({ serviceIds }: z.infer<typeof skillsFormSchema>) {
    if (blocked || pending) return
    if (sameSkills(serviceIds, snapshot.serviceIds)) {
      report("Choose a different skill set before saving.")
      return
    }
    if (
      options.some((option) => !option.active && serviceIds.includes(option.id))
    ) {
      report(
        "Remove unavailable services explicitly before saving. Skills needed by active work remain protected."
      )
      return
    }
    setMessage(undefined)
    setReviewed(serviceIds)
  }
  function loadMore() {
    startLoading(async () => {
      try {
        const result = await loadSkillOptions(page + 1)
        if (!result.ok) {
          report(result.message)
          return
        }
        // Catalog pages extend choices without replacing the full saved/draft selection.
        setOptions((current) => [
          ...new Map(
            [
              ...current,
              ...result.data.items.map(({ id, name }) => ({
                id,
                name,
                active: true,
              })),
            ].map((option) => [option.id, option])
          ).values(),
        ])
        setPage(result.data.pagination.page)
      } catch {
        report("More services could not be read. Your selection is preserved.")
      }
    })
  }
  function confirm() {
    if (!reviewed || blocked || pending) return
    onBusy(true)
    startTransition(async () => {
      try {
        const result = await replaceTechnicianSkills(snapshot.technicianId, {
          serviceIds: reviewed,
          expectedServiceIds: snapshot.serviceIds,
        })
        setReviewed(null)
        if (result.ok) {
          toast.add({ type: "success", title: result.message })
          onSaved()
        } else {
          setBlocked(!!result.conflict || !!result.uncertain)
          report(result.message)
        }
      } catch {
        setReviewed(null)
        setBlocked(true)
        report(
          "The skill replacement outcome is uncertain. Inspect current skills before another change."
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
        onSubmit={(event) => {
          handleSubmit(review)(event).catch(() =>
            report("Check the service selections.")
          )
        }}
        className="space-y-5"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Replace the full skill set. Skills required by active work cannot be
          removed. An empty set removes all idle qualifications.
        </p>
        <fieldset
          disabled={!isReady || pending || blocked}
          className="space-y-4"
        >
          <legend className="mb-4 text-sm font-medium">
            Qualified services
          </legend>
          <Controller
            name="serviceIds"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                {!options.length && (
                  <p className="text-sm text-muted-foreground">
                    No services are available.
                  </p>
                )}
                {options.map((option) => (
                  <div key={option.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`skill-${option.id}`}
                      checked={field.value.includes(option.id)}
                      onBlur={field.onBlur}
                      disabled={
                        pending ||
                        blocked ||
                        (!option.active && !field.value.includes(option.id))
                      }
                      aria-invalid={!!errors.serviceIds}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...field.value, option.id]
                            : field.value.filter((id) => id !== option.id)
                        )
                      }
                    />
                    <Label
                      htmlFor={`skill-${option.id}`}
                      className="min-w-0 flex-wrap break-words"
                    >
                      {option.name}
                      {!option.active && (
                        <Badge variant="outline">Unavailable</Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
          <FormMessage message={errors.serviceIds?.message} />
          {page < pages && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={loadMore}
            >
              {loading ? "Reading services…" : "Load more services"}
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            Review skill replacement
          </Button>
        </fieldset>
        <FormMessage message={message} />
        {blocked && (
          <Button type="button" variant="outline" onClick={onInspect}>
            Inspect current skills
          </Button>
        )}
      </form>
      <AlertDialog
        open={reviewed !== null}
        onOpenChange={(next) => {
          if (!next && !pending) setReviewed(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewed?.length
                ? "Replace technician skills?"
                : "Remove all technician skills?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewed?.length ?? 0} services will remain qualified. The
              complete saved set is replaced only if it still matches the
              inspected set.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              Keep editing
            </AlertDialogCancel>
            <Button disabled={pending} onClick={confirm}>
              {pending ? "Saving…" : "Confirm skill replacement"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
