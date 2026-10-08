import "server-only"

import type { z } from "zod"
import { getServerEnv } from "../env/server"
import { ApiError } from "./error"
import { apiErrorSchema, apiSuccessSchema } from "./schemas"

type ApiRequestOptions = {
  accessToken?: string
  idempotencyKey?: string
  signal?: AbortSignal
} & (
  | { method?: "GET"; body?: never }
  | { method: "POST" | "PATCH"; body?: unknown }
  | { method: "DELETE"; body?: never }
)

function endpointUrl(baseUrl: string, path: string) {
  const base = new URL(`${baseUrl}/`)
  const url = new URL(path.slice(1), base)
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    url.origin !== base.origin ||
    !url.pathname.startsWith(base.pathname) ||
    url.hash
  ) {
    throw new Error(
      "API paths must stay under the configured /api/v1 base URL."
    )
  }
  return url
}

export async function apiRequest<T>(
  path: string,
  dataSchema: z.ZodType<T>,
  options: ApiRequestOptions = {}
) {
  const url = endpointUrl(getServerEnv().API_BASE_URL, path)
  const headers = new Headers({ Accept: "application/json" })
  if (options.accessToken)
    headers.set("Authorization", `Bearer ${options.accessToken}`)
  if (options.idempotencyKey)
    headers.set("Idempotency-Key", options.idempotencyKey)
  if (options.body !== undefined)
    headers.set("Content-Type", "application/json")

  const timeout = AbortSignal.timeout(30_000)
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
    signal,
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
  }
  if (options.body !== undefined) init.body = JSON.stringify(options.body)

  let response: Response
  try {
    response = await fetch(url, init)
  } catch {
    // Mutations may have reached the backend. Never retry automatically.
    throw new ApiError(
      "The API could not be reached. The operation outcome may be unknown.",
      "network",
      null
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError(
      "The API returned an unreadable response.",
      "invalid-response",
      response.status
    )
  }

  if (!response.ok) {
    const failure = apiErrorSchema.safeParse(payload)
    if (failure.success) {
      throw new ApiError(
        failure.data.message,
        "http",
        response.status,
        failure.data.errors
      )
    }
    throw new ApiError(
      "The API request failed.",
      "invalid-response",
      response.status
    )
  }

  const result = apiSuccessSchema(dataSchema).safeParse(payload)
  if (!result.success) {
    throw new ApiError(
      "The API returned an unexpected response.",
      "invalid-response",
      response.status
    )
  }
  return result.data
}
