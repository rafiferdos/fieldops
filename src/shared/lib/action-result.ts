import { ApiError } from "@/infrastructure/api/error"
import type { RecordRoute } from "./routes"

export type ActionResult =
  | {
      ok: true
      message: string
      destination?: RecordRoute
    }
  | { ok: false; message: string; conflict?: boolean; uncertain?: boolean }

export function actionFailure(
  error: unknown
): Extract<ActionResult, { ok: false }> {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return {
        ok: false,
        conflict: true,
        message:
          "This record has changed. Reload the latest state before trying again.",
      }
    if (
      error.kind === "network" ||
      error.kind === "invalid-response" ||
      (error.status !== null && error.status >= 500)
    )
      return {
        ok: false,
        uncertain: true,
        message:
          "The outcome could not be confirmed. Check the latest record before submitting again.",
      }
    if (error.status === 401)
      return {
        ok: false,
        message: "Your session has expired. Please sign in again.",
      }
    if (error.status === 404)
      return { ok: false, message: "This record is unavailable." }
    if (error.status === 429)
      return {
        ok: false,
        message: "Too many attempts. Please wait before trying again.",
      }
    if (error.status === 400 || error.status === 403)
      return { ok: false, message: error.message }
  }
  return {
    ok: false,
    message: "The operation is unavailable. Please try again later.",
  }
}
