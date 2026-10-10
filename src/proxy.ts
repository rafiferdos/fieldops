import { NextResponse, type NextRequest } from "next/server"

// Cookie presence is only a fast preflight; pages/actions still verify the current session and role.
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(
    request.nextUrl.protocol === "https:"
      ? "__Host-fieldops-session"
      : "fieldops-session"
  )?.value
  if (cookie && /^[A-Za-z0-9_-]{43}$/.test(cookie))
    return NextResponse.next()
  const login = new URL("/login", request.url)
  login.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/technician/:path*",
    "/account",
    "/payments/:path*",
    "/payment/:path*",
  ],
}
