import { randomBytes } from "node:crypto"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import {
  createStoredSession,
  deleteStoredSession,
  readStoredSession,
} from "@/infrastructure/session/store"
import { sessionRedis } from "@/infrastructure/session/redis"
import { sessionAccessToken } from "./session"

vi.mock("server-only", () => ({}))
const redisUrl = process.env.SESSION_TEST_REDIS_URL
describe.skipIf(!redisUrl)("refresh coordination with real Redis", () => {
  const ids: string[] = []
  const fetchMock = vi.fn<typeof fetch>()
  beforeAll(() => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3001")
    vi.stubEnv("SESSION_REDIS_URL", redisUrl ?? "")
    vi.stubEnv("SESSION_ENCRYPTION_KEY", randomBytes(32).toString("base64"))
    vi.stubEnv("API_BASE_URL", "https://api.example.com/api/v1")
    vi.stubGlobal("fetch", fetchMock)
  })
  afterAll(async () => {
    for (const id of ids) await deleteStoredSession(id)
    await (await sessionRedis()).close()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  async function expiredSession() {
    const id = await createStoredSession({
      accessToken: "expired",
      refreshToken: "one-use",
      accessExpiresAt: Date.now() - 1000,
      refreshExpiresAt: Date.now() + 600000,
      refreshPending: false,
    })
    ids.push(id)
    return id
  }
  it("refreshes once across concurrent callers and stores the rotated token", async () => {
    const id = await expiredSession()
    fetchMock.mockResolvedValue(
      Response.json({
        success: true,
        message: "Rotated",
        data: {
          user: {
            id: "00000000-0000-4000-8000-000000000001",
            name: "User",
            email: "user@example.com",
            role: "CUSTOMER",
            createdAt: new Date().toISOString(),
          },
          accessToken: "new-access",
          refreshToken: "new-refresh",
          tokenType: "Bearer",
          expiresIn: 900,
          refreshExpiresAt: new Date(Date.now() + 600000).toISOString(),
        },
      })
    )
    expect(
      await Promise.all(
        Array.from({ length: 10 }, () => sessionAccessToken(id))
      )
    ).toEqual(Array.from({ length: 10 }, () => "new-access"))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect((await readStoredSession(id))?.refreshToken).toBe("new-refresh")
  })
  it("discards an uncertain rotation and never replays its refresh token", async () => {
    fetchMock
      .mockReset()
      .mockRejectedValue(new Error("connection lost after write"))
    const id = await expiredSession()
    expect(
      await Promise.all([sessionAccessToken(id), sessionAccessToken(id)])
    ).toEqual([null, null])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(await readStoredSession(id)).toBeNull()
  })
  it("fails closed after a crash left refresh in progress", async () => {
    fetchMock.mockReset()
    const id = await createStoredSession({
      accessToken: "old",
      refreshToken: "must-not-replay",
      accessExpiresAt: Date.now() - 1000,
      refreshExpiresAt: Date.now() + 600000,
      refreshPending: true,
    })
    ids.push(id)
    expect(await sessionAccessToken(id)).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
