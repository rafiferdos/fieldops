import type { ReactNode } from "react"

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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <p className="text-sm font-medium tracking-widest text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
