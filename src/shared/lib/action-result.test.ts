import { expect, it } from "vitest"
import { ApiError } from "@/infrastructure/api/error"
import { actionFailure } from "./action-result"

it("treats unreadable or server-failed mutations as uncertain without exposing internals", () => {
  for (const error of [
    new ApiError("private internals", "network", null),
    new ApiError("private internals", "invalid-response", 200),
    ...[500, 502, 503].map(
      (status) => new ApiError("private internals", "http", status)
    ),
  ]) {
    expect(actionFailure(error)).toMatchObject({ ok: false, uncertain: true })
    expect(actionFailure(error).message).not.toContain("private internals")
  }
})

it("requires latest-state recovery for a conflicting mutation", () => {
  expect(
    actionFailure(new ApiError("Stale version", "http", 409))
  ).toMatchObject({ ok: false, conflict: true })
})
