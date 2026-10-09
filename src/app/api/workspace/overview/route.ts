import { NextResponse } from "next/server"
import { getViewer } from "@/features/auth/session"
import { overviewFilterSchema } from "@/features/admin/schemas"
import { getDashboard } from "@/features/workspace/server"
import { ApiError } from "@/infrastructure/api/error"

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" }

export async function GET(request: Request) {
  try {
    const viewer = await getViewer()
    if (!viewer)
      return NextResponse.json(
        { ok: false, message: "Your session ended. Please sign in again." },
        { status: 401, headers }
      )
    const search = new URL(request.url).searchParams
    const input: Record<string, unknown> = { from: "", to: "" }
    // Reject duplicates and ownership parameters rather than forwarding an arbitrary proxy.
    for (const [key, value] of search) {
      if ((key !== "from" && key !== "to") || search.getAll(key).length !== 1)
        return NextResponse.json(
          { ok: false, message: "Invalid dashboard filters." },
          { status: 400, headers }
        )
      input[key] = value
    }
    const filters = overviewFilterSchema.safeParse(input)
    if (
      !filters.success ||
      (viewer.profile.role !== "ADMIN" &&
        (input.from !== "" || input.to !== ""))
    )
      return NextResponse.json(
        { ok: false, message: "Invalid dashboard filters." },
        { status: 400, headers }
      )
    const data = await getDashboard(viewer, filters.data, request.signal)
    return NextResponse.json({ ok: true, data }, { headers })
  } catch (error) {
    const status =
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
        ? error.status
        : 503
    return NextResponse.json(
      {
        ok: false,
        message:
          status === 503
            ? "Live workspace data is unavailable. Please try again."
            : "Your account no longer has access. Please sign in again.",
      },
      { status, headers }
    )
  }
}
