"use client"
import { useState } from "react"
import { LogOut } from "lucide-react"
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
        aria-label={pending ? "Signing out…" : "Sign out"}
        disabled={pending}
        onClick={() => {
          void submit()
        }}
      >
        {/* An icon keeps narrow headers usable; the accessible name stays explicit. */}
        <LogOut aria-hidden="true" className="size-4" />
        <span className="sr-only sm:not-sr-only">
          {pending ? "Signing out…" : "Sign out"}
        </span>
      </Button>
      <FormMessage message={message} />
    </div>
  )
}
