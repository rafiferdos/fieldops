import "server-only"
import { z } from "zod"
import { notFound, redirect } from "next/navigation"
import { roleHome } from "@/features/auth/policy"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import {
  invoicePath,
  invoiceSchema,
  paymentSchema,
  type BillingRole,
} from "./schemas"

// A technician's nested summary does not grant access to the direct billing API.
export async function getInvoice(id: string, role: BillingRole) {
  if (!z.uuid().safeParse(id).success) notFound()
  const { accessToken } = await requireViewer(role, invoicePath(role, id))
  try {
    return (await apiRequest(`/invoices/${id}`, invoiceSchema, { accessToken }))
      .data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
}

export async function getPayment(id: string) {
  if (!z.uuid().safeParse(id).success) notFound()
  const viewer = await requireViewer(undefined, `/payments/${id}`)
  if (viewer.profile.role === "TECHNICIAN")
    redirect(roleHome(viewer.profile.role))
  try {
    const payment = (
      await apiRequest(`/payments/${id}`, paymentSchema, {
        accessToken: viewer.accessToken,
      })
    ).data
    const invoice = await getInvoice(payment.invoiceId, viewer.profile.role)
    return { payment, invoice, role: viewer.profile.role }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
}
