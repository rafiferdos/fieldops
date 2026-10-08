import "server-only"

import { serverEnvSchema } from "./schema"

export function getServerEnv() {
  const result = serverEnvSchema.safeParse({
    API_BASE_URL: process.env.API_BASE_URL,
  })
  if (!result.success) {
    throw new Error(
      "Invalid server configuration: set API_BASE_URL to an /api/v1 URL. See .env.example."
    )
  }
  return result.data
}
