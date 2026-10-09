"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { Card } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import type { FaqItem } from "../faq-content"

// Base UI owns expanded state and keyboard behavior; the answer stays inside its card.
export function FaqCard({ item }: { item: FaqItem }) {
  return (
    <Collapsible className="group/faq">
      <Card className="faq-card">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 42px), (max-width: 1279px) calc(33.333vw - 35px), 392px"
          className="faq-image object-cover"
        />
        <div className="faq-shade" aria-hidden="true" />
        <div className="faq-summary">
          <p className="text-xs font-medium text-white/80">{item.category}</p>
          <h3 className="mt-3 max-w-64 font-heading text-3xl leading-[1.08] font-medium tracking-[-0.035em]">
            {item.title}
          </h3>
        </div>
        <CollapsibleContent className="faq-answer">
          <p className="eyebrow">{item.category}</p>
          <h3 className="mt-5 font-heading text-3xl leading-tight font-medium tracking-[-0.035em]">
            {item.question}
          </h3>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
          <p className="mt-auto pt-8 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Field notes / {item.id}
          </p>
        </CollapsibleContent>
        <CollapsibleTrigger
          aria-label={item.question}
          className="faq-trigger"
          render={
            <Button
              variant="secondary"
              size="icon"
              className="faq-plus size-11 rounded-full"
            />
          }
        >
          <Plus
            aria-hidden="true"
            className="size-5 transition-transform duration-300 group-data-open/faq:rotate-45"
          />
        </CollapsibleTrigger>
      </Card>
      {/* The complete answer remains available if client scripts cannot run. */}
      <noscript>
        <p className="mt-4 text-sm leading-relaxed">
          <strong>{item.question}</strong>
          <br />
          {item.answer}
        </p>
      </noscript>
    </Collapsible>
  )
}
