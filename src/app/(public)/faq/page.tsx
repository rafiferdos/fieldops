import { publicMetadata } from "@/infrastructure/seo/metadata"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { FaqCards } from "@/features/marketing/components/faq-cards"
import { PageHeading } from "@/shared/components/page-heading"

export const metadata = publicMetadata(
  "Frequently asked questions",
  "Answers about service requests, confirmed schedules, cancellations, invoices and verified payments.",
  "/faq"
)

export default function FaqPage() {
  return (
    <>
      <PageHeading
        eyebrow="Good questions. Clear answers."
        title="A little clarity, before you book."
        description="The details that make your next step easier. Open a field note to explore the answer."
      />
      <FaqCards />
      <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t pt-8">
        <p className="text-muted-foreground">
          A clear plan starts with the right service.
        </p>
        <Link href="/services" className="text-link">
          Explore services
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </>
  )
}
