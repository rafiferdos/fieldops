"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { updateProfileSchema } from "../schemas"
import { updateProfile } from "../actions"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { toast } from "@/shared/ui/toast"
import { FormMessage } from "@/shared/components/form-message"

export function ProfileForm({
  name,
  phone,
}: {
  name: string
  phone: string | null
}) {
  const router = useRouter(),
    [message, setMessage] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name, phone: phone ?? "" },
  })
  async function submit(values: z.infer<typeof updateProfileSchema>) {
    try {
      const result = await updateProfile(values)
      if (result.ok) {
        setMessage(undefined)
        toast.add({ type: "success", title: result.message })
        router.refresh()
      } else setMessage(result.message)
    } catch {
      setMessage(
        "Profile update could not be confirmed. Reload before trying again."
      )
    }
  }
  return (
    <form
      onSubmit={(event) => {
        handleSubmit(submit)(event).catch(() =>
          setMessage("The form could not be submitted. Please try again.")
        )
      }}
      className="max-w-lg space-y-5"
      noValidate
    >
      <fieldset disabled={isSubmitting} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FormMessage message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <p className="text-xs text-muted-foreground">
            Use international format. Leave empty to remove your phone number.
          </p>
          <FormMessage message={errors.phone?.message} />
        </div>
        <Button type="submit">
          {isSubmitting ? "Saving…" : "Save profile"}
        </Button>
      </fieldset>
      <FormMessage message={message} />
    </form>
  )
}
