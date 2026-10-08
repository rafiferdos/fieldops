"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { FormMessage } from "@/shared/components/form-message"
import { signOut } from "../actions"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false),
    [message, setMessage] = useState<string>()
  async function submit() {
    setPending(true)
    try {
      const result = await signOut()
      if (result.ok) {
        router.replace("/login")
        router.refresh()
      } else setMessage(result.message)
    } catch {
      setMessage("Sign-out could not be confirmed. Please try again.")
    } finally {
      setPending(false)
    }
  }
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => {
          void submit()
        }}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      <FormMessage message={message} />
    </div>
  )
}
