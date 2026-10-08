import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { apiRequest } from "./server"

vi.mock("server-only", () => ({}))

const dataSchema = z.object({ id: z.string() })
const success = { success: true, message: "OK", data: { id: "record-1" } }
const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://api.example.com/api/v1")
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("server API boundary", () => {
  it("validates the envelope and data and keeps tokens in headers", async () => {
    fetchMock.mockResolvedValue(Response.json(success))
    const result = await apiRequest("/records?page=2", dataSchema, {
      accessToken: "private-token",
    })
    expect(result.data.id).toBe("record-1")
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toEqual(
      new URL("https://api.example.com/api/v1/records?page=2")
    )
    expect(init).toMatchObject({
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      method: "GET",
    })
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer private-token"
    )
    expect(init?.body).toBeUndefined()
  })

  it.each([401, 403, 404, 409, 429, 502, 503])(
    "preserves HTTP %s with safe backend details",
    async (status) => {
      fetchMock.mockResolvedValue(
        Response.json(
          { success: false, message: "Request rejected", errors: [] },
          { status }
        )
      )
      await expect(apiRequest("/records", dataSchema)).rejects.toMatchObject({
        kind: "http",
        status,
        details: [],
        message: "Request rejected",
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)
    }
  )

  it.each([
    "//evil.example/records",
    "/../auth",
    "/%2e%2e/auth",
    "https://evil.example/records",
    "/records#fragment",
    "/\\evil.example/records",
  ])("rejects a path that could escape the API boundary: %s", async (path) => {
    await expect(
      apiRequest(path, dataSchema, { accessToken: "secret" })
    ).rejects.toThrow("API paths")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    { success: true, data: { id: 12 }, message: "OK" },
    { success: false, message: "unexpected", errors: [] },
    { data: { id: "record-1" } },
  ])("rejects an invalid success contract", async (payload) => {
    fetchMock.mockResolvedValue(Response.json(payload))
    await expect(apiRequest("/records", dataSchema)).rejects.toMatchObject({
      kind: "invalid-response",
      status: 200,
    })
  })

  it("does not expose proxy HTML or raw parse errors", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>internal secret</html>", { status: 502 })
    )
    await expect(apiRequest("/records", dataSchema)).rejects.toMatchObject({
      message: "The API returned an unreadable response.",
      status: 502,
    })
  })

  it("does not retry uncertain checkout and preserves its idempotency key", async () => {
    fetchMock.mockRejectedValue(new Error("private network internals"))
    await expect(
      apiRequest("/invoices/123/checkout", dataSchema, {
        method: "POST",
        body: { billing: { city: "Dhaka" } },
        idempotencyKey: "stable-key-123456789",
      })
    ).rejects.toMatchObject({ kind: "network", status: null })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0] ?? []
    expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(
      "stable-key-123456789"
    )
    expect(init?.body).toBe(JSON.stringify({ billing: { city: "Dhaka" } }))
  })

  it("fails configuration without leaking its value or sending a request", async () => {
    vi.stubEnv(
      "API_BASE_URL",
      "https://user:private-secret@api.example.com/api/v1"
    )
    await expect(apiRequest("/records", dataSchema)).rejects.toThrow(
      "Invalid server configuration"
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
