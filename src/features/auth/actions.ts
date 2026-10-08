"use server"

import { z } from "zod"
import { apiRequest } from "@/infrastructure/api/server"
import { ApiError } from "@/infrastructure/api/error"
import { getDemoCredentials } from "@/infrastructure/env/auth"
import { requireSameOrigin } from "@/infrastructure/session/origin"
import { actionFailure, type ActionResult } from "@/shared/lib/action-result"
import {
  credentialsSchema,
  loginSchema,
  registerSchema,
  roleSchema,
  userSchema,
} from "./schemas"
import { clearSession, establishSession, getViewer } from "./session"
import { safeReturnPath } from "./policy"

export async function signIn(
  input: unknown,
  returnTo: unknown
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, message: "Enter a valid email and password." }
  try {
    await requireSameOrigin()
    const result = await apiRequest("/auth/login", credentialsSchema, {
      method: "POST",
      body: parsed.data,
    })
    await establishSession(result.data)
    return {
      ok: true,
      message: "Signed in successfully.",
      destination: safeReturnPath(returnTo, result.data.user.role),
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      return {
        ok: false,
        message: "The email or password could not be verified.",
      }
    return actionFailure(error)
  }
}

export async function register(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      message: "Check the registration fields and try again.",
    }
  try {
    await requireSameOrigin()
    await apiRequest("/auth/register", userSchema, {
      method: "POST",
      body: parsed.data,
    })
    return {
      ok: true,
      message: "Account created. Sign in to continue.",
      destination: "/login?registered=1",
    }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function signInDemo(
  input: unknown,
  returnTo: unknown
): Promise<ActionResult> {
  const parsed = roleSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, message: "Choose a supported demo account." }
  const credentials = getDemoCredentials(parsed.data)
  if (!credentials)
    return { ok: false, message: "This demo account is not configured." }
  return signIn(credentials, returnTo)
}

export async function signInGoogle(
  input: unknown,
  returnTo: unknown
): Promise<ActionResult> {
  const parsed = z
    .strictObject({ credential: z.string().min(1).max(8192) })
    .safeParse(input)
  if (!parsed.success)
    return { ok: false, message: "Google sign-in could not be verified." }
  try {
    await requireSameOrigin()
    const result = await apiRequest("/auth/google", credentialsSchema, {
      method: "POST",
      body: parsed.data,
    })
    await establishSession(result.data)
    return {
      ok: true,
      message: "Signed in successfully.",
      destination: safeReturnPath(returnTo, result.data.user.role),
    }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function signOut(): Promise<ActionResult> {
  try {
    await requireSameOrigin()
    try {
      const viewer = await getViewer()
      if (viewer)
        await apiRequest("/auth/logout", z.null(), {
          method: "POST",
          accessToken: viewer.accessToken,
        })
    } finally {
      await clearSession()
    }
    return { ok: true, message: "Signed out.", destination: "/login" }
  } catch (error) {
    return actionFailure(error)
  }
}
