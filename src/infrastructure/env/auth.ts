import "server-only"
import { z } from "zod"

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"])
const originSchema = z.url().refine((value) => {
  const url = new URL(value)
  return (
    url.origin === value &&
    (url.protocol === "https:" ||
      (url.protocol === "http:" && localHosts.has(url.hostname)))
  )
})
const redisUrlSchema = z.url().refine((value) => {
  const url = new URL(value)
  return (
    url.protocol === "rediss:" ||
    (url.protocol === "redis:" && localHosts.has(url.hostname))
  )
})
export const authEnvSchema = z.object({
  APP_ORIGIN: originSchema,
  SESSION_REDIS_URL: redisUrlSchema,
  SESSION_ENCRYPTION_KEY: z
    .base64()
    .refine((value) => Buffer.from(value, "base64").length === 32),
})

export function getAuthEnv() {
  const result = authEnvSchema.safeParse(process.env)
  if (!result.success)
    throw new Error("Invalid authentication configuration. See .env.example.")
  return result.data
}

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || null
}

export function getDemoCredentials(role: "CUSTOMER" | "TECHNICIAN" | "ADMIN") {
  const result = z
    .object({ email: z.email(), password: z.string().min(1).max(128) })
    .safeParse({
      email: process.env[`DEMO_${role}_EMAIL`],
      password: process.env[`DEMO_${role}_PASSWORD`],
    })
  return result.success ? result.data : null
}
