import { randomBytes, randomUUID } from "node:crypto"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { sessionRedis } from "@/infrastructure/session/redis"
import {
  attachPayment,
  readIntent,
  removeTerminalIntent,
  reserveIntent,
} from "./intent-store"
vi.mock("server-only", () => ({}))
const redisUrl = process.env.SESSION_TEST_REDIS_URL
describe.skipIf(!redisUrl)("checkout recovery with real Redis", () => {
  const customer = randomUUID(),
    invoice = randomUUID(),
    billing = {
      address: "Disposable test address",
      city: "Dhaka",
      postcode: "1209",
    }
  beforeAll(() => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3001")
    vi.stubEnv("SESSION_REDIS_URL", redisUrl ?? "")
    vi.stubEnv("SESSION_ENCRYPTION_KEY", randomBytes(32).toString("base64"))
  })
  afterAll(async () => {
    const client = await sessionRedis()
    await client.del(`fieldops:frontend:checkout:${customer}:${invoice}`)
    await client.close()
    vi.unstubAllEnvs()
  })
  it("reserves one intent across competing tabs and refuses different billing", async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        reserveIntent(customer, invoice, billing)
      )
    )
    expect(new Set(results.map((result) => result.key)).size).toBe(1)
    await expect(
      reserveIntent(customer, invoice, { ...billing, city: "Changed city" })
    ).rejects.toThrow("different billing")
    expect(await readIntent(customer, randomUUID())).toBeNull()
  })
  it("cannot overwrite or erase another intent with a stale key", async () => {
    const intent = await readIntent(customer, invoice)
    if (!intent) throw new Error("Test reservation missing")
    const paymentId = randomUUID()
    await attachPayment(customer, invoice, intent.key, paymentId)
    await removeTerminalIntent(customer, invoice, randomUUID())
    expect((await readIntent(customer, invoice))?.paymentId).toBe(paymentId)
    await expect(
      attachPayment(customer, invoice, randomUUID(), randomUUID())
    ).rejects.toThrow("intent changed")
    await removeTerminalIntent(customer, invoice, intent.key)
    expect(await readIntent(customer, invoice)).toBeNull()
  })
})
