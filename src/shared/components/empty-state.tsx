import type { ReactNode } from "react"
import { Search } from "lucide-react"

export function EmptyState({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 py-12 text-center">
      <span className="mb-5 flex size-12 items-center justify-center rounded-2xl border bg-background text-muted-foreground">
        <Search aria-hidden="true" className="size-5" />
      </span>
      <h2 className="font-heading text-xl font-medium">{title}</h2>
      <div className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
