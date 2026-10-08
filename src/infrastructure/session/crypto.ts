import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto"
import { z } from "zod"

export const sessionTokensSchema = z.object({
  accessToken: z.string().min(1).max(8192),
  refreshToken: z.string().min(1).max(8192),
  accessExpiresAt: z.number().int().positive(),
  refreshExpiresAt: z.number().int().positive(),
  refreshPending: z.boolean(),
})
export type SessionTokens = z.infer<typeof sessionTokensSchema>
export const sessionIdSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)
export function newSessionId() {
  return randomBytes(32).toString("base64url")
}
export function sessionKey(id: string) {
  return `fieldops:frontend:session:${createHash("sha256").update(id).digest("hex")}`
}

export function sealTokens(value: SessionTokens, key: Buffer, context: string) {
  const nonce = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, nonce)
  cipher.setAAD(Buffer.from(context))
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ])
  return Buffer.concat([nonce, cipher.getAuthTag(), encrypted]).toString(
    "base64"
  )
}

export function openTokens(
  value: string,
  key: Buffer,
  context: string
): SessionTokens | null {
  try {
    const packed = Buffer.from(value, "base64")
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      packed.subarray(0, 12)
    )
    decipher.setAAD(Buffer.from(context))
    decipher.setAuthTag(packed.subarray(12, 28))
    const plaintext = Buffer.concat([
      decipher.update(packed.subarray(28)),
      decipher.final(),
    ]).toString("utf8")
    const parsed: unknown = JSON.parse(plaintext)
    return sessionTokensSchema.parse(parsed)
  } catch {
    return null
  }
}
