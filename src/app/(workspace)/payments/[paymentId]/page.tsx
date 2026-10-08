import { PaymentStatus } from "@/features/billing/components/payment-status"
export const metadata = { title: "Payment status" }
export default async function PaymentPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  return <PaymentStatus paymentId={(await params).paymentId} />
}
