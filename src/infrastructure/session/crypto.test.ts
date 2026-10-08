import { randomBytes } from "node:crypto"
import { describe, expect, it } from "vitest"
import {
  newSessionId,
  openTokens,
  sealTokens,
  sessionIdSchema,
  sessionKey,
  type SessionTokens,
} from "./crypto"

describe("opaque encrypted sessions", () => {
  const tokens: SessionTokens = {
    accessToken: "private-access",
    refreshToken: "private-refresh",
    accessExpiresAt: 1000,
    refreshExpiresAt: 2000,
    refreshPending: false,
  }
  it("keeps secrets out of cookie IDs and stored ciphertext", () => {
    const id = newSessionId(),
      context = sessionKey(id),
      key = randomBytes(32)
    const sealed = sealTokens(tokens, key, context)
    expect(sessionIdSchema.safeParse(id).success).toBe(true)
    expect(context).not.toContain(id)
    expect(sealed).not.toContain("private")
    expect(openTokens(sealed, key, context)).toEqual(tokens)
    expect(sealTokens(tokens, key, context)).not.toBe(sealed)
  })
  it("rejects tampering, key changes and moving a payload to another session", () => {
    const key = randomBytes(32),
      sealed = sealTokens(tokens, key, "session-a")
    const packed = Buffer.from(sealed, "base64")
    packed[30] = (packed[30] ?? 0) ^ 1
    expect(openTokens(packed.toString("base64"), key, "session-a")).toBeNull()
    expect(openTokens(sealed, randomBytes(32), "session-a")).toBeNull()
    expect(openTokens(sealed, key, "session-b")).toBeNull()
    expect(openTokens("broken", key, "session-a")).toBeNull()
  })
})
