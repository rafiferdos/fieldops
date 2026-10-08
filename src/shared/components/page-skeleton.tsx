import { Skeleton } from "@/shared/ui/skeleton"

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <noscript>
        <p className="rounded-xl border p-4 text-sm text-muted-foreground">
          Enable JavaScript to load current services and manage visits.
        </p>
      </noscript>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((id) => (
          <Skeleton key={id} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
