import { randomBytes } from "node:crypto"
import { afterEach, expect, it, vi } from "vitest"
import { authEnvSchema } from "../env/auth"
import { requireSameOrigin } from "./origin"

vi.mock("server-only", () => ({}))
const requestHeaders = vi.hoisted(() => ({ value: new Headers() }))
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(requestHeaders.value),
}))
afterEach(() => vi.unstubAllEnvs())

it("accepts only the configured exact browser origin for mutations", async () => {
  vi.stubEnv("APP_ORIGIN", "http://localhost:3001")
  vi.stubEnv("SESSION_REDIS_URL", "redis://localhost:6397")
  vi.stubEnv("SESSION_ENCRYPTION_KEY", randomBytes(32).toString("base64"))
  requestHeaders.value = new Headers({ origin: "http://localhost:3001" })
  await expect(requireSameOrigin()).resolves.toBeUndefined()
  for (const origin of [
    "https://evil.example",
    "http://localhost:3001.evil.example",
    "",
  ]) {
    requestHeaders.value = origin ? new Headers({ origin }) : new Headers()
    await expect(requireSameOrigin()).rejects.toThrow("Untrusted action origin")
  }
})

it("rejects insecure remote session infrastructure and undersized encryption keys", () => {
  const config = {
    APP_ORIGIN: "https://fieldops.example",
    SESSION_REDIS_URL: "rediss://sessions.example:6379",
    SESSION_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  }
  expect(authEnvSchema.safeParse(config).success).toBe(true)
  expect(
    authEnvSchema.safeParse({
      ...config,
      APP_ORIGIN: "http://fieldops.example",
    }).success
  ).toBe(false)
  expect(
    authEnvSchema.safeParse({
      ...config,
      SESSION_REDIS_URL: "redis://sessions.example:6379",
    }).success
  ).toBe(false)
  expect(
    authEnvSchema.safeParse({
      ...config,
      SESSION_ENCRYPTION_KEY: randomBytes(16).toString("base64"),
    }).success
  ).toBe(false)
})
