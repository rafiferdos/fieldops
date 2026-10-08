import { PageHeading } from "@/shared/components/page-heading"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui/accordion"
import { Reveal } from "@/shared/components/reveal"

export const metadata = { title: "Frequently asked questions" }
export default function FaqPage() {
  return (
    <>
      <PageHeading
        title="A little clarity, before you book."
        description="Answers based on the FieldOps service process."
      />
      {/* Official Base UI disclosure keeps keyboard and expanded state in sync. */}
      <Reveal className="max-w-4xl">
        <Accordion defaultValue={["Is my preferred time a confirmed booking?"]}>
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
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="px-6 py-6 font-heading text-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                {question}
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2 leading-relaxed text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </>
  )
}
