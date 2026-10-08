import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { getAuthEnv } from "@/infrastructure/env/auth"
import {
  createStoredSession,
  deleteStoredSession,
  readStoredSession,
  withSessionLock,
} from "@/infrastructure/session/store"
import {
  sessionIdSchema,
  type SessionTokens,
} from "@/infrastructure/session/crypto"
import {
  credentialsSchema,
  profileSchema,
  type Credentials,
  type Role,
} from "./schemas"
import { roleHome } from "./policy"

function cookieName() {
  return getAuthEnv().APP_ORIGIN.startsWith("https:")
    ? "__Host-fieldops-session"
    : "fieldops-session"
}
function tokensFrom(credentials: Credentials): SessionTokens {
  return {
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    accessExpiresAt:
      Date.now() + Math.max(0, credentials.expiresIn - 35) * 1000,
    refreshExpiresAt: Date.parse(credentials.refreshExpiresAt),
    refreshPending: false,
  }
}
export async function establishSession(credentials: Credentials) {
  const id = await createStoredSession(tokensFrom(credentials))
  const jar = await cookies()
  const previous = sessionIdSchema.safeParse(jar.get(cookieName())?.value)
  jar.set(cookieName(), id, {
    httpOnly: true,
    secure: getAuthEnv().APP_ORIGIN.startsWith("https:"),
    sameSite: "lax",
    path: "/",
    expires: new Date(credentials.refreshExpiresAt),
  })
  if (previous.success) await deleteStoredSession(previous.data)
}
export async function sessionId() {
  const raw = (await cookies()).get(cookieName())?.value
  const result = sessionIdSchema.safeParse(raw)
  return result.success ? result.data : null
}

export async function sessionAccessToken(id: string) {
  const initial = await readStoredSession(id)
  if (!initial || initial.refreshExpiresAt <= Date.now()) return null
  if (!initial.refreshPending && initial.accessExpiresAt > Date.now())
    return initial.accessToken
  return withSessionLock(id, async (save) => {
    const current = await readStoredSession(id)
    if (!current || current.refreshExpiresAt <= Date.now()) return null
    if (current.refreshPending) {
      await deleteStoredSession(id)
      return null
    }
    if (current.accessExpiresAt > Date.now()) return current.accessToken
    // Poison the old token before network I/O. A crash or uncertain refresh must not replay it.
    await save({ ...current, refreshPending: true })
    try {
      const result = await apiRequest("/auth/refresh", credentialsSchema, {
        method: "POST",
        body: { refreshToken: current.refreshToken },
      })
      const replacement = tokensFrom(result.data)
      await save(replacement)
      return replacement.accessToken
    } catch {
      await deleteStoredSession(id)
      return null
    }
  })
}

export const getViewer = cache(async () => {
  const id = await sessionId()
  if (!id) return null
  const accessToken = await sessionAccessToken(id)
  if (!accessToken) return null
  try {
    const profile = (
      await apiRequest("/users/me", profileSchema, { accessToken })
    ).data
    return { profile, accessToken }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await deleteStoredSession(id)
      return null
    }
    throw error
  }
})

export async function requireViewer(role?: Role, returnTo?: string) {
  const viewer = await getViewer()
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({ returnTo: returnTo ?? "/account" })}`
    )
  if (role && viewer.profile.role !== role)
    redirect(roleHome(viewer.profile.role))
  return viewer
}

export async function clearSession() {
  const id = await sessionId()
  ;(await cookies()).delete(cookieName())
  if (id) await deleteStoredSession(id)
}
