import { redirect } from "next/navigation"
import { AuthForm } from "@/features/auth/components/auth-form"
import { getViewer } from "@/features/auth/session"
import { roleHome } from "@/features/auth/policy"
import { PageHeading } from "@/shared/components/page-heading"

export const metadata = { title: "Create an account" }
export default async function RegisterPage() {
  const viewer = await getViewer()
  if (viewer) redirect(roleHome(viewer.profile.role))
  return (
    <>
      <PageHeading
        eyebrow="Get started"
        title="Your next service starts here."
        description="Create a customer account to request and track services."
      />
      <AuthForm mode="register" googleClientId={null} demoRoles={[]} />
    </>
  )
}
