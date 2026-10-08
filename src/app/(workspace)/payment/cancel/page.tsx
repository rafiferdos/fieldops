import { PaymentReturn } from "@/features/billing/components/payment-return"
import type { SearchValues } from "@/shared/lib/list-query"
export const metadata = { title: "Inspect checkout return" }
export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>
}) {
  return <PaymentReturn values={await searchParams} />
}
