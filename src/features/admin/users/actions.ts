"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { clearSession, requireViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import { queryString } from "@/shared/lib/list-query"
import {
  accessSnapshotSchema,
  accessUpdateSchema,
  changedAccess,
  managedUserPageSchema,
  managedUserSchema,
  managedUsersQuerySchema,
} from "./schemas"

export async function updateManagedAccess(
  id: unknown,
  snapshot: unknown,
  directory: unknown,
  input: unknown
): Promise<ActionResult> {
  const identifier = z.uuid().safeParse(id),
    expected = accessSnapshotSchema.safeParse(snapshot),
    query = managedUsersQuerySchema.safeParse(directory),
    parsed = accessUpdateSchema.safeParse(input)
  if (
    !identifier.success ||
    !expected.success ||
    !query.success ||
    !parsed.success
  )
    return {
      ok: false,
      message: "Check the account and choose a valid access change.",
    }
  await requireSameOrigin()
  const { profile, accessToken } = await requireViewer("ADMIN")
  let writeStarted = false
  try {
    // There is no user-detail API. Re-read the original directory page and match its exact ID.
    const page = (
      await apiRequest(
        `/admin/users?${queryString(query.data)}`,
        managedUserPageSchema,
        { accessToken }
      )
    ).data
    const current = page.items.find((user) => user.id === identifier.data)
    if (
      !current ||
      current.updatedAt !== expected.data.updatedAt ||
      current.role !== expected.data.role ||
      current.status !== expected.data.status
    )
      return {
        ok: false,
        conflict: true,
        message:
          "This account or directory page changed. Inspect the latest directory before changing access.",
      }
    const change = changedAccess(current, parsed.data)
    if (!change.success)
      return {
        ok: false,
        message:
          "Choose a role or status that differs from the current account.",
      }
    writeStarted = true
    const updated = (
      await apiRequest(`/admin/users/${current.id}`, managedUserSchema, {
        method: "PATCH",
        accessToken,
        body: change.data,
      })
    ).data
    if (updated.id !== current.id)
      throw new Error("Access response does not match target")
    revalidatePath("/admin/users")
    revalidatePath("/admin")
    // Actual access changes revoke every backend session, including this admin's own session.
    if (current.id === profile.id) {
      await clearSession()
      return {
        ok: true,
        message:
          "Your access changed. Sign in again with your current permissions.",
        destination: "/login",
      }
    }
    return {
      ok: true,
      message:
        "Access updated. Existing sessions were revoked; this user must sign in again.",
    }
  } catch (error) {
    const failure = actionFailure(error)
    if (error instanceof ApiError && error.status === 409)
      return { ...failure, message: `Access change blocked. ${error.message}` }
    // A failure after dispatch may hide a committed revocation; inspection precedes another write.
    const rejected =
      error instanceof ApiError &&
      error.kind === "http" &&
      error.status !== null &&
      error.status < 500
    return {
      ...failure,
      uncertain: failure.uncertain || (writeStarted && !rejected),
    }
  }
}
