import { describe, expect, it } from "vitest"
import { serverEnvSchema } from "./schema"

describe("server environment boundary", () => {
  it.each([
    "https://fieldops-api-xu3s.onrender.com/api/v1",
    "http://localhost:3001/api/v1/",
  ])("accepts versioned API URL %s", (url) => {
    expect(serverEnvSchema.parse({ API_BASE_URL: url }).API_BASE_URL).toBe(
      url.replace(/\/$/, "")
    )
  })
  it.each([
    undefined,
    "",
    "http://example.com/api/v1",
    "https://example.com",
    "https://example.com/api/v2",
    "https://user:secret@example.com/api/v1",
    "https://example.com/api/v1?token=secret",
    "https://example.com/api/v1#fragment",
  ])("rejects unsafe or missing API URL %s", (url) => {
    expect(serverEnvSchema.safeParse({ API_BASE_URL: url }).success).toBe(false)
  })
})
