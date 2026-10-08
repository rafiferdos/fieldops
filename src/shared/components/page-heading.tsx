import type { ReactNode } from "react"
import { Reveal } from "./reveal"

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b pb-8">
      <div className="max-w-3xl min-w-0 space-y-4">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-heading text-4xl leading-[1.08] font-medium tracking-[-0.04em] break-words sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed break-words text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </Reveal>
  )
}
