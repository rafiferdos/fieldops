"use client"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"

// An explicit read refresh never posts a payment mutation or callback.
export function PaymentRefresh() {
  const router = useRouter(),
    [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Checking…" : "Check latest status"}
    </Button>
  )
}
