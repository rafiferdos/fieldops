"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { FormMessage } from "@/shared/components/form-message"
import { toast } from "@/shared/ui/toast"
import { signIn, register as registerAccount, signInDemo } from "../actions"
import { loginSchema, registerSchema, type Role } from "../schemas"
import { GoogleSignIn } from "./google-sign-in"

type Fields = z.infer<typeof registerSchema>

export function AuthForm({
  mode,
  returnTo,
  googleClientId,
  demoRoles,
}: {
  mode: "login" | "register"
  returnTo?: string
  googleClientId: string | null
  demoRoles: Role[]
}) {
  const router = useRouter()
  const registering = mode === "register"
  const schema = registering
    ? registerSchema
    : loginSchema.extend({ name: z.string() })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isReady },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })
  const [message, setMessage] = useState<string>()
  const [demoPending, setDemoPending] = useState(false)
  const busy = !isReady || isSubmitting || demoPending

  async function submit(values: Fields) {
    setMessage(undefined)
    try {
      const result = registering
        ? await registerAccount(values)
        : await signIn(
            { email: values.email, password: values.password },
            returnTo
          )
      if (!result.ok) {
        setMessage(result.message)
        return
      }
      toast.add({ type: "success", title: result.message })
      if (result.destination) {
        router.push(result.destination)
        router.refresh()
      }
    } catch {
      setMessage("Sign-in is unavailable. Please try again later.")
    }
  }
  async function demo(role: Role) {
    setDemoPending(true)
    setMessage(undefined)
    try {
      const result = await signInDemo(role, returnTo)
      if (result.ok && result.destination) {
        router.push(result.destination)
        router.refresh()
      } else if (!result.ok) setMessage(result.message)
    } catch {
      setMessage("Demo sign-in is unavailable.")
    } finally {
      setDemoPending(false)
    }
  }
  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          handleSubmit(submit)(event).catch(() =>
            setMessage("The form could not be submitted. Please try again.")
          )
        }}
        className="space-y-5"
        noValidate
      >
        <fieldset disabled={busy} className="space-y-5">
          {registering && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              <FormMessage id="name-error" message={errors.name?.message} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            <FormMessage id="email-error" message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={registering ? "new-password" : "current-password"}
              aria-invalid={!!errors.password}
              aria-describedby={
                [
                  registering ? "password-help" : null,
                  errors.password ? "password-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              {...register("password")}
            />
            {registering && (
              <p id="password-help" className="text-xs text-muted-foreground">
                Use 15–128 characters. Your account will be a customer account.
              </p>
            )}
            <FormMessage
              id="password-error"
              message={errors.password?.message}
            />
          </div>
          <Button type="submit" className="w-full">
            {isSubmitting
              ? "Please wait…"
              : registering
                ? "Create customer account"
                : "Sign in"}
          </Button>
        </fieldset>
        <FormMessage message={message} />
      </form>
      {!registering && googleClientId && (
        <GoogleSignIn clientId={googleClientId} returnTo={returnTo} />
      )}
      {!registering && demoRoles.length > 0 && (
        <section className="space-y-3 border-t pt-5" aria-label="Demo accounts">
          <p className="text-sm text-muted-foreground">
            Explore with a demo account
          </p>
          <div className="flex flex-wrap gap-2">
            {demoRoles.map((role) => (
              <Button
                key={role}
                variant="outline"
                disabled={busy}
                onClick={() => {
                  void demo(role)
                }}
              >
                {role === "CUSTOMER"
                  ? "Customer"
                  : role === "TECHNICIAN"
                    ? "Technician"
                    : "Admin"}{" "}
                demo
              </Button>
            ))}
          </div>
        </section>
      )}
      <p className="text-sm text-muted-foreground">
        {registering ? "Already have an account? " : "New to FieldOps? "}
        <Link
          className="font-medium text-foreground underline underline-offset-4"
          href={registering ? "/login" : "/register"}
        >
          {registering ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  )
}
