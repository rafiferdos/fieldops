import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { checkoutIntentSchema, type CheckoutIntent } from "./schemas"

// Billing is encrypted at rest and authenticated against its customer/invoice key.
export function sealIntent(
  intent: CheckoutIntent,
  key: Buffer,
  context: string
) {
  const nonce = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, nonce)
  cipher.setAAD(Buffer.from(context))
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(intent), "utf8"),
    cipher.final(),
  ])
  return Buffer.concat([nonce, cipher.getAuthTag(), encrypted]).toString(
    "base64"
  )
}
export function openIntent(
  payload: string,
  key: Buffer,
  context: string
): CheckoutIntent {
  try {
    const packed = Buffer.from(payload, "base64"),
      decipher = createDecipheriv("aes-256-gcm", key, packed.subarray(0, 12))
    decipher.setAAD(Buffer.from(context))
    decipher.setAuthTag(packed.subarray(12, 28))
    const parsed: unknown = JSON.parse(
      Buffer.concat([
        decipher.update(packed.subarray(28)),
        decipher.final(),
      ]).toString("utf8")
    )
    return checkoutIntentSchema.parse(parsed)
  } catch {
    // Corruption cannot silently generate another payment key.
    throw new Error(
      "Checkout recovery data is unavailable. Do not start another charge."
    )
  }
}
