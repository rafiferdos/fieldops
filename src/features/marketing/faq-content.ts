// Public answers reflect the implemented backend's scheduling, ownership and money rules.
export const faqItems = [
  {
    id: "schedule",
    category: "Making a plan",
    title: "Your time matters. So does a clear plan.",
    question: "Is my preferred time a confirmed booking?",
    answer:
      "No. An administrator reviews your request and assigns an available qualified technician. The assigned schedule is shown with your work order.",
    image: "/images/editorial/visit-plan.png",
    alt: "An open planner and emerald cup in natural window light",
  },
  {
    id: "changes",
    category: "Room for change",
    title: "Plans change. Here’s what can, too.",
    question: "Can I change or cancel my request?",
    answer:
      "You can edit your own pending request. Eligible pending or approved requests can be cancelled before work starts. Once the technician is en route, cancellation is unavailable.",
    image: "/images/editorial/visit-care.png",
    alt: "A technician carefully adjusting an oak cabinet hinge",
  },
  {
    id: "price",
    category: "The details, kept",
    title: "Good work deserves a clear record.",
    question: "When is the service price recorded?",
    answer:
      "The catalog shows a base price. A price snapshot is recorded when the visit is assigned and the invoice is issued when the technician completes the work.",
    image: "/images/editorial/visit-record.png",
    alt: "A carefully maintained stone sink with green tiles and a folded cloth",
  },
  {
    id: "payment",
    category: "Payment clarity",
    title: "A return page isn’t a receipt.",
    question: "Does a payment redirect mean my invoice is paid?",
    answer:
      "No. FieldOps relies on server-side gateway validation. An unresolved payment may need verification before the invoice is marked paid.",
    image: "/images/editorial/service-still-life.png",
    alt: "Precision service tools on textured emerald work cloth",
  },
  {
    id: "feedback",
    category: "After the visit",
    title: "The last word belongs to you.",
    question: "When can I leave feedback?",
    answer:
      "After your work is completed and the invoice is verified as paid, with no payment review hold. Each work order accepts feedback once.",
    image: "/images/editorial/visit-record.png",
    alt: "Sunlight over a neatly maintained home fixture",
  },
] as const

export type FaqItem = (typeof faqItems)[number]
