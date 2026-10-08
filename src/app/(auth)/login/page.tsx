import { redirect } from "next/navigation"
import { AuthForm } from "@/features/auth/components/auth-form"
import { getViewer } from "@/features/auth/session"
import { safeReturnPath } from "@/features/auth/policy"
import {
  getDemoCredentials,
  getGoogleClientId,
} from "@/infrastructure/env/auth"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { PageHeading } from "@/shared/components/page-heading"

export const metadata = { title: "Sign in" }
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  const search = await searchParams,
    returnTo = firstValue(search.returnTo)
  const viewer = await getViewer()
  if (viewer) redirect(safeReturnPath(returnTo, viewer.profile.role))
  const demoRoles = (["CUSTOMER", "TECHNICIAN", "ADMIN"] as const).filter(
    (role) => getDemoCredentials(role) !== null
  )
  return (
    <>
      <PageHeading
        eyebrow="Welcome back"
        title="A little less to manage."
        description="Sign in to your FieldOps workspace."
      />
      {firstValue(search.registered) === "1" && (
        <p role="status" className="mb-5 rounded-xl border p-4 text-sm">
          Account created. Sign in to continue.
        </p>
      )}
      <AuthForm
        mode="login"
        {...(returnTo ? { returnTo } : {})}
        googleClientId={getGoogleClientId()}
        demoRoles={demoRoles}
      />
    </>
  )
}
