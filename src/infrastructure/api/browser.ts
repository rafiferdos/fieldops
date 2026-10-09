"use client"

import axios from "axios"
import { z } from "zod"
import { ApiError } from "./error"

const failureSchema = z.object({ message: z.string().min(1).max(500) })
const transport = axios.create({
  timeout: 35_000,
  headers: { Accept: "application/json" },
})

// A narrow same-origin read surface keeps Bearer tokens on the server.
export async function readBrowserApi<T>(
  path: "/api/workspace/overview",
  params: { from?: string; to?: string },
  schema: z.ZodType<T>,
  signal: AbortSignal
) {
  try {
    const response = await transport.get<unknown>(path, { params, signal })
    const parsed = z
      .object({ ok: z.literal(true), data: schema })
      .safeParse(response.data)
    if (!parsed.success)
      throw new ApiError(
        "The workspace returned an unexpected response.",
        "invalid-response",
        response.status
      )
    return parsed.data.data
  } catch (error) {
    if (axios.isCancel(error) || error instanceof ApiError) throw error
    if (axios.isAxiosError<unknown>(error)) {
      const parsed = failureSchema.safeParse(error.response?.data)
      throw new ApiError(
        parsed.success
          ? parsed.data.message
          : "The workspace could not be refreshed. Please try again.",
        error.response ? "http" : "network",
        error.response?.status ?? null
      )
    }
    throw new ApiError(
      "The workspace could not be refreshed. Please try again.",
      "network",
      null
    )
  }
}
