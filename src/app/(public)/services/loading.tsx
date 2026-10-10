import { PageSkeleton } from "@/shared/components/page-skeleton"

// The catalog list and nested detail route share an accessible streaming boundary.
export default function ServicesLoading() {
  return <PageSkeleton />
}
