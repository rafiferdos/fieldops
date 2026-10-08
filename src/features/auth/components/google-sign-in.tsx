"use client"

import { useRef, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { signInGoogle } from "../actions"
import { FormMessage } from "@/shared/components/form-message"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: unknown) => void
            auto_select: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              type: "standard"
              theme: "outline"
              size: "large"
              text: "signin_with"
            }
          ) => void
        }
      }
    }
  }
}

export function GoogleSignIn({
  clientId,
  returnTo,
}: {
  clientId: string
  returnTo: string | undefined
}) {
  const target = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [message, setMessage] = useState<string>()
  async function complete(response: unknown) {
    const parsed = z.object({ credential: z.string() }).safeParse(response)
    if (!parsed.success) {
      setMessage("Google did not return a valid credential.")
      return
    }
    try {
      const result = await signInGoogle(parsed.data, returnTo)
      if (result.ok && result.destination) {
        router.push(result.destination)
      } else if (!result.ok) setMessage(result.message)
      router.refresh()
    } catch {
      setMessage("Google sign-in is unavailable. Please try email sign-in.")
    }
  }
  function initialize() {
    if (!window.google || !target.current) return
    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      callback: (response) => {
        void complete(response)
      },
    })
    window.google.accounts.id.renderButton(target.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
    })
  }
  return (
    <div className="space-y-3">
      <div ref={target} />
      <FormMessage message={message} />
      <Script
        src="https://accounts.google.com/gsi/client"
        onReady={initialize}
        onError={() =>
          setMessage("Google sign-in could not load. Please use email sign-in.")
        }
      />
    </div>
  )
}
