import { Reveal } from "@/shared/components/reveal"
import { faqItems } from "../faq-content"
import { FaqCard } from "./faq-card"

// The homepage previews three topics; the dedicated route retains every contract answer.
export function FaqCards({ preview = false }: { preview?: boolean }) {
  const items = preview ? faqItems.slice(0, 3) : faqItems
  return (
    <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <FaqCard key={item.id} item={item} />
      ))}
    </Reveal>
  )
}
