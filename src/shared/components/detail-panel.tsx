import type { ReactNode } from "react"
import { cn } from "cn"
import { Card } from "@/shared/ui/card"

// Preserve description-list semantics inside the shared shadcn reading surface.
export function DetailPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border p-6 shadow-none sm:p-8", className)}>
      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 [&>div]:min-w-0">
        {children}
      </dl>
    </Card>
  )
}
