import { PageHeading } from "@/shared/components/page-heading"

export const metadata = { title: "Frequently asked questions" }
export default function FaqPage() {
  return (
    <>
      <PageHeading
        title="A little clarity, before you book."
        description="Answers based on the FieldOps service process."
      />
      <dl className="max-w-3xl divide-y">
        {[
          [
            "Is my preferred time a confirmed booking?",
            "No. An administrator reviews your request and assigns an available qualified technician. The assigned schedule is shown with your work order.",
          ],
          [
            "Can I change or cancel my request?",
            "You can edit your own pending request. Eligible pending or approved requests can be cancelled before work starts. Once the technician is en route, cancellation is unavailable.",
          ],
          [
            "When is the service price recorded?",
            "The catalog shows a base price. A price snapshot is recorded when the visit is assigned and the invoice is issued when the technician completes the work.",
          ],
          [
            "Does a payment redirect mean my invoice is paid?",
            "No. FieldOps relies on server-side gateway validation. An unresolved payment may need verification before the invoice is marked paid.",
          ],
          [
            "When can I leave feedback?",
            "After your work is completed and the invoice is verified as paid, with no payment review hold. Each work order accepts feedback once.",
          ],
        ].map(([question, answer]) => (
          <div key={question} className="py-6">
            <dt className="font-heading text-lg font-medium">{question}</dt>
            <dd className="mt-3 leading-relaxed text-muted-foreground">
              {answer}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
