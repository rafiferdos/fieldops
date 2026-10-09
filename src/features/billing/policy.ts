import type { Invoice, Payment } from "./schemas"

type PaymentOutcome = {
  kind:
    "inspection" | "review" | "verified" | "cancelled" | "failed" | "pending"
  title: string
  description: string
}

// Backend state, matching frozen money and settlement evidence must agree before success.
export function paymentOutcome(
  payment: Payment,
  invoice: Invoice
): PaymentOutcome {
  if (
    payment.invoiceId !== invoice.id ||
    payment.amountMinor !== invoice.amountMinor ||
    payment.currency !== invoice.currency
  )
    return {
      kind: "inspection",
      title: "Payment needs inspection",
      description:
        "The payment and invoice details do not agree. Do not start another attempt.",
    }
  if (payment.requiresReview || payment.status === "REVIEW")
    return {
      kind: "review",
      title: "Payment needs review",
      description:
        "This attempt needs administrator review. Any existing paid settlement remains recorded. Do not start another charge.",
    }
  if (
    payment.status === "SUCCEEDED" &&
    invoice.status === "PAID" &&
    payment.verifiedAt &&
    payment.settledAt &&
    invoice.paidAt
  )
    return {
      kind: "verified",
      title: "Payment verified",
      description:
        "The provider-verified payment has settled and the invoice is paid.",
    }
  if (
    (payment.status === "FAILED" || payment.status === "CANCELLED") &&
    invoice.status === "UNPAID" &&
    payment.verifiedAt
  )
    return {
      kind: payment.status === "CANCELLED" ? "cancelled" : "failed",
      title:
        payment.status === "CANCELLED" ? "Payment cancelled" : "Payment failed",
      description:
        "The invoice remains unpaid. You can review the invoice before explicitly starting a new attempt.",
    }
  return {
    kind: "pending",
    title: "Payment not yet confirmed",
    description:
      "Check the latest status after checkout. A redirect or callback acknowledgement alone does not confirm payment.",
  }
}

export function canStartNewAttempt(payment: Payment, invoice: Invoice) {
  return (
    payment.invoiceId === invoice.id &&
    payment.amountMinor === invoice.amountMinor &&
    invoice.status === "UNPAID" &&
    !payment.requiresReview &&
    !!payment.verifiedAt &&
    (payment.status === "FAILED" || payment.status === "CANCELLED")
  )
}

// Exact HTTPS origins prevent a compromised response from becoming an arbitrary redirect.
export function safeCheckoutUrl(payment: Payment, invoice: Invoice) {
  if (
    payment.status !== "PENDING" ||
    payment.requiresReview ||
    invoice.status !== "UNPAID" ||
    payment.invoiceId !== invoice.id ||
    payment.amountMinor !== invoice.amountMinor ||
    !payment.checkoutUrl
  )
    return null
  const url = new URL(payment.checkoutUrl)
  const origin =
    payment.mode === "SANDBOX"
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com"
  return url.origin === origin && !url.username && !url.password && !url.hash
    ? url.toString()
    : null
}
