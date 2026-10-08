import type { ReactNode } from "react"

export function EmptyState({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center">
      <h2 className="font-heading text-xl font-medium">{title}</h2>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </div>
  )
}
