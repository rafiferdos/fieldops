import type { Route } from "next"
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

export function safeReturnPath(
  value: unknown,
  role: Role
): Route<`/customer/requests/${string}`> {
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
