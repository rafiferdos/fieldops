import { ButtonLink } from "@/shared/components/button-link"
import { ArrowLeft } from "lucide-react"
import { StatusScreen } from "@/shared/components/status-screen"

export default function NotFound() {
  return (
    <main id="main-content">
      <StatusScreen
        kind="missing"
        title="Page not found"
        description="The requested page does not exist."
      >
        <ButtonLink href="/">
          <ArrowLeft aria-hidden="true" />
          Return home
        </ButtonLink>
      </StatusScreen>
    </main>
  )
}
