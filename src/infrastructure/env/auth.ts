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
    // Remote session storage requires authentication as well as transport encryption.
    (url.protocol === "rediss:" && url.password.length > 0) ||
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

export function getAppOrigin() {
  const result = originSchema.safeParse(process.env.APP_ORIGIN)
  if (!result.success) throw new Error("Invalid APP_ORIGIN. See .env.example.")
  return result.data
}

export function getAuthEnv() {
  const result = authEnvSchema.safeParse(process.env)
  if (!result.success)
    throw new Error("Invalid authentication configuration. See .env.example.")
  return result.data
}

export function getGoogleClientId() {
  const value = process.env.GOOGLE_CLIENT_ID
  if (!value) return null
  const parsed = z
    .string()
    .max(256)
    .regex(/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/)
    .safeParse(value)
  if (!parsed.success) throw new Error("Invalid Google sign-in configuration.")
  return parsed.data
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
