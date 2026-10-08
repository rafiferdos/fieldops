import type { ReactNode } from "react"
import { CircleHelp, TriangleAlert } from "lucide-react"

// Recovery screens use the same hierarchy while each caller owns its safe next action.
export function StatusScreen({
  title,
  description,
  kind,
  children,
}: {
  title: string
  description: string
  kind: "missing" | "error"
  children: ReactNode
}) {
  const Icon = kind === "missing" ? CircleHelp : TriangleAlert
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-2xl flex-col items-start justify-center px-6 py-16">
      <span className="mb-7 flex size-14 items-center justify-center rounded-2xl border bg-muted/50 text-muted-foreground">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <p className="eyebrow">
        {kind === "missing" ? "A different direction" : "A brief interruption"}
      </p>
      <h1 className="mt-4 font-heading text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </section>
  )
}
