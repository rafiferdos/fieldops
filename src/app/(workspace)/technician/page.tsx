import Link from "next/link"
import { requireViewer } from "@/features/auth/session"
import { PageHeading } from "@/shared/components/page-heading"
export const metadata = { title: "Technician workspace" }
export default async function TechnicianPage() {
  const { profile } = await requireViewer("TECHNICIAN", "/technician")
  return (
    <>
      <PageHeading
        eyebrow="Technician workspace"
        title={`Welcome, ${profile.name}`}
        description="Your technician account is connected. Keep your contact details up to date for service visits."
      />
      <Link href="/account" className="underline underline-offset-4">
        Manage account
      </Link>
    </>
  )
}
