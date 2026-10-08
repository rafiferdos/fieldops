"use server"
import { z } from "zod"
import { requireViewer } from "@/features/auth/session"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { apiRequest } from "@/infrastructure/api/server"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import { revalidatePath } from "next/cache"
import { checkoutSchema, invoiceSchema, paymentSchema } from "./schemas"
import {
  attachPayment,
  readIntent,
  removeTerminalIntent,
  reserveIntent,
} from "./intent-store"
import { canStartNewAttempt } from "./policy"

export async function recoverCheckout(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    parsed = checkoutSchema.safeParse(input)
  if (!identifier.success || !parsed.success)
    return { ok: false, message: "Check your invoice and billing details." }
  await requireSameOrigin()
  const { profile, accessToken } = await requireViewer("CUSTOMER")
  try {
    // Ownership and supported money/profile bounds are checked before reserving any intent.
    const invoice = (
      await apiRequest(`/invoices/${identifier.data}`, invoiceSchema, {
        accessToken,
      })
    ).data
    const existing = await readIntent(profile.id, invoice.id)
    if (
      !existing &&
      (invoice.status !== "UNPAID" ||
        invoice.amountMinor < 1000 ||
        invoice.amountMinor > 50000000)
    )
      return {
        ok: false,
        message:
          "Checkout requires an unpaid invoice between BDT 10 and BDT 500,000.",
      }
    if (
      !existing &&
      (!profile.phone ||
        !/^\+[1-9]\d{1,14}$/.test(profile.phone) ||
        profile.name.length > 50 ||
        profile.email.length > 50)
    )
      return {
        ok: false,
        message:
          "Update your account with an international phone number and a name/email within 50 characters before checkout.",
      }
    const intent = await reserveIntent(
      profile.id,
      invoice.id,
      parsed.data.billing
    )
    const payment = (
      await apiRequest(
        `/invoices/${invoice.id}/payment-session`,
        paymentSchema,
        {
          method: "POST",
          accessToken,
          idempotencyKey: intent.key,
          body: { billing: intent.billing },
        }
      )
    ).data
    if (
      payment.invoiceId !== invoice.id ||
      payment.amountMinor !== invoice.amountMinor
    )
      throw new Error("Payment does not match invoice")
    await attachPayment(profile.id, invoice.id, intent.key, payment.id)
    revalidatePath(`/customer/invoices/${invoice.id}`)
    return {
      ok: true,
      message:
        "Checkout state loaded. Review the verified status before continuing.",
      destination: `/payments/${payment.id}`,
    }
  } catch (error) {
    const result = actionFailure(error)
    return {
      ...result,
      message: result.conflict
        ? "Checkout conflicts with the current invoice or attempt. Keep the same billing and recover the existing intent; check your account details if needed."
        : "Checkout could not be confirmed. Your original intent is retained; use Recover checkout with the same billing. Do not start another charge.",
    }
  }
}

// A new key is permitted only after reading a verified terminal attempt and its unpaid invoice.
export async function prepareNewAttempt(id: unknown): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id)
  if (!identifier.success)
    return { ok: false, message: "This invoice is unavailable." }
  await requireSameOrigin()
  const { profile, accessToken } = await requireViewer("CUSTOMER")
  try {
    const intent = await readIntent(profile.id, identifier.data)
    if (!intent?.paymentId)
      return { ok: false, message: "Recover the original checkout first." }
    const payment = (
      await apiRequest(`/payments/${intent.paymentId}`, paymentSchema, {
        accessToken,
      })
    ).data
    const invoice = (
      await apiRequest(`/invoices/${identifier.data}`, invoiceSchema, {
        accessToken,
      })
    ).data
    if (!canStartNewAttempt(payment, invoice))
      return {
        ok: false,
        message:
          "This attempt is still unresolved, paid or under review. A new attempt is blocked.",
      }
    await removeTerminalIntent(profile.id, invoice.id, intent.key)
    revalidatePath(`/customer/invoices/${invoice.id}`)
    return {
      ok: true,
      message:
        "The terminal attempt was inspected. You may enter billing for a new checkout.",
    }
  } catch (error) {
    return actionFailure(error)
  }
}
