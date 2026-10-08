import "server-only"
import { z } from "zod"
import { notFound } from "next/navigation"
import { requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { invoicePath, invoiceSchema, type BillingRole } from "./schemas"

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
