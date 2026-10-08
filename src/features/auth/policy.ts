import type { RecordRoute } from "@/shared/lib/routes"
import { workDetailPath } from "@/features/work-orders/routes"
import { z } from "zod"
import type { Role } from "./schemas"

export function roleHome(role: Role) {
  switch (role) {
    case "CUSTOMER":
      return "/customer"
    case "TECHNICIAN":
      return "/technician"
    case "ADMIN":
      return "/admin"
  }
}

export function safeReturnPath(value: unknown, role: Role): RecordRoute {
  const fallback = roleHome(role)
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return fallback
  try {
    const url = new URL(value, "https://fieldops.invalid")
    const path = decodeURIComponent(url.pathname)
    if (
      url.origin !== "https://fieldops.invalid" ||
      /[\\\u0000-\u0020]/.test(path)
    )
      return fallback
    const root = roleHome(role)
    if (path === "/account") return "/account"
    if (path === root) return `${root}?${url.searchParams.toString()}`
    // Preserve only implemented role-specific queues and validated record IDs.
    if (role === "CUSTOMER" && path === "/customer/work-orders")
      return `/customer/work-orders?${url.searchParams.toString()}`
    if (role === "ADMIN" && path === "/admin/requests")
      return `/admin/requests?${url.searchParams.toString()}`
    if (role === "ADMIN" && path === "/admin/work-orders")
      return `/admin/work-orders?${url.searchParams.toString()}`
    if (role !== "TECHNICIAN") {
      const invoicePrefix = `/${role.toLowerCase()}/invoices/`
      if (path.startsWith(invoicePrefix)) {
        const id = z.uuid().safeParse(path.slice(invoicePrefix.length))
        if (id.success)
          return role === "ADMIN"
            ? `/admin/invoices/${id.data}`
            : `/customer/invoices/${id.data}`
      }
    }
    const workPrefix = `/${role.toLowerCase()}/work-orders/`
    if (path.startsWith(workPrefix)) {
      const id = z.uuid().safeParse(path.slice(workPrefix.length))
      if (id.success) return workDetailPath(role, id.data)
    }
    if (role === "ADMIN" && path.startsWith("/admin/requests/")) {
      const id = z.uuid().safeParse(path.slice("/admin/requests/".length))
      if (id.success) return `/admin/requests/${id.data}`
    }
    if (role === "CUSTOMER" && path === "/customer/requests/new") {
      const service = z.uuid().safeParse(url.searchParams.get("serviceId"))
      return service.success
        ? `/customer/requests/new?serviceId=${service.data}`
        : "/customer/requests/new"
    }
    if (role === "CUSTOMER" && path.startsWith("/customer/requests/")) {
      const id = z.uuid().safeParse(path.slice("/customer/requests/".length))
      if (id.success) return `/customer/requests/${id.data}`
    }
  } catch {
    /* Invalid encoding is not a return destination. */
  }
  return fallback
}
