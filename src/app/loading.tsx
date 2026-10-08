import { PageSkeleton } from "@/shared/components/page-skeleton"

export default function Loading() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <PageSkeleton />
    </main>
  )
}
