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
        description="Review customer requests, assign qualified technicians and follow confirmed visits."
      />
      <div className="flex flex-wrap gap-5">
        <Link href="/admin/requests" className="underline underline-offset-4">
          Review requests
        </Link>
        <Link
          href="/admin/work-orders"
          className="underline underline-offset-4"
        >
          Follow work orders
        </Link>
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
