import type { Invoice, Payment } from "./schemas"

// Backend state, matching frozen money and settlement evidence must agree before success.
export function paymentOutcome(payment: Payment, invoice: Invoice) {
  if (
    payment.invoiceId !== invoice.id ||
    payment.amountMinor !== invoice.amountMinor ||
    payment.currency !== invoice.currency
  )
    return {
      title: "Payment needs inspection",
      description:
        "The payment and invoice details do not agree. Do not start another attempt.",
    }
  if (payment.requiresReview || payment.status === "REVIEW")
    return {
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
      title:
        payment.status === "CANCELLED" ? "Payment cancelled" : "Payment failed",
      description:
        "The invoice remains unpaid. You can review the invoice before explicitly starting a new attempt.",
    }
  return {
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
