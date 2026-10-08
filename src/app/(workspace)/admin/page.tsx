import Link from "next/link"
import { requireViewer } from "@/features/auth/session"
import { PageHeading } from "@/shared/components/page-heading"
export const metadata = { title: "Admin workspace" }
export default async function AdminPage() {
  const { profile } = await requireViewer("ADMIN", "/admin")
  return (
    <>
      <PageHeading
        eyebrow="Administrator workspace"
        title={`Welcome, ${profile.name}`}
        description="Your administrator account is connected. Manage your contact details or explore the current service catalog."
      />
      <div className="flex flex-wrap gap-5">
        <Link href="/account" className="underline underline-offset-4">
          Manage account
        </Link>
        <Link href="/services" className="underline underline-offset-4">
          Browse services
        </Link>
      </div>
    </>
  )
}
