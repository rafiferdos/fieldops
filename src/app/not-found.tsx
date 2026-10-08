import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { StatusScreen } from "@/shared/components/status-screen"

export default function NotFound() {
  return (
    <main id="main-content">
      <StatusScreen
        kind="missing"
        title="Page not found"
        description="The requested page does not exist."
      >
        <Button render={<Link href="/" />}>
          <ArrowLeft aria-hidden="true" />
          Return home
        </Button>
      </StatusScreen>
    </main>
  )
}
