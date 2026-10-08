"use client"

import { Button } from "@/shared/ui/button"
import { StatusScreen } from "@/shared/components/status-screen"

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <StatusScreen
      kind="error"
      title="Something went wrong"
      description="We could not display this page. Please try again."
    >
      <Button onClick={retry}>Try again</Button>
    </StatusScreen>
  )
}
