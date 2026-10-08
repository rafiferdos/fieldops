import { z } from "zod"
import { requireViewer } from "@/features/auth/session"
import { roleHome } from "@/features/auth/policy"
import { PageHeading } from "@/shared/components/page-heading"
import { ButtonLink } from "@/shared/components/button-link"
import { firstValue, type SearchValues } from "@/shared/lib/list-query"
import { PaymentStatus } from "./payment-status"

// Return labels and query values cannot manufacture payment success or cancellation.
export async function PaymentReturn({ values }: { values: SearchValues }) {
  const { profile } = await requireViewer()
  const id = z.uuid().safeParse(firstValue(values.paymentId))
  if (id.success) return <PaymentStatus paymentId={id.data} />
  return (
    <>
      <PageHeading
        eyebrow="Payment return"
        title="Check your payment record"
        description="This return did not identify an attempt. Open the saved payment status from your invoice; payment is not confirmed by this page."
      />
      <ButtonLink href={roleHome(profile.role)}>Return to workspace</ButtonLink>
    </>
  )
}
