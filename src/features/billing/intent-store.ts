import "server-only"
import { randomUUID } from "node:crypto"
import { sessionRedis } from "@/infrastructure/session/redis"
import { getAuthEnv } from "@/infrastructure/env/auth"
import { openIntent, sealIntent } from "./intent-crypto"
import type { Billing, CheckoutIntent } from "./schemas"

const retentionSeconds = 30 * 86400
function storeKey(customerId: string, invoiceId: string) {
  return `fieldops:frontend:checkout:${customerId}:${invoiceId}`
}
function encryptionKey() {
  return Buffer.from(getAuthEnv().SESSION_ENCRYPTION_KEY, "base64")
}
export async function readIntent(customerId: string, invoiceId: string) {
  const key = storeKey(customerId, invoiceId),
    payload = await (await sessionRedis()).get(key)
  return payload ? openIntent(payload, encryptionKey(), key) : null
}

// NX selects one immutable intent across tabs and frontend instances before provider I/O.
export async function reserveIntent(
  customerId: string,
  invoiceId: string,
  billing: Billing
) {
  const key = storeKey(customerId, invoiceId),
    client = await sessionRedis()
  const intent: CheckoutIntent = {
    key: randomUUID(),
    billing,
    paymentId: null,
    createdAt: new Date().toISOString(),
  }
  if (
    (await client.set(key, sealIntent(intent, encryptionKey(), key), {
      NX: true,
      EX: retentionSeconds,
    })) === "OK"
  )
    return intent
  const existing = await readIntent(customerId, invoiceId)
  if (!existing)
    throw new Error("Checkout recovery data changed. Reload the invoice.")
  if (
    existing.billing.address !== billing.address ||
    existing.billing.city !== billing.city ||
    existing.billing.postcode !== billing.postcode
  )
    throw new Error(
      "An existing attempt uses different billing. Reload and recover its original details."
    )
  return existing
}

// Compare-and-set prevents a late response from overwriting a newer explicitly authorized intent.
export async function attachPayment(
  customerId: string,
  invoiceId: string,
  intentKey: string,
  paymentId: string
) {
  const key = storeKey(customerId, invoiceId),
    client = await sessionRedis(),
    payload = await client.get(key)
  if (!payload)
    throw new Error(
      "Checkout recovery data expired. Inspect the invoice before continuing."
    )
  const intent = openIntent(payload, encryptionKey(), key)
  if (intent.key !== intentKey)
    throw new Error("Checkout intent changed. Reload the invoice.")
  const changed = await client.eval(
    "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2], 'KEEPTTL'); return 1 else return 0 end",
    {
      keys: [key],
      arguments: [
        payload,
        sealIntent({ ...intent, paymentId }, encryptionKey(), key),
      ],
    }
  )
  if (changed !== 1)
    throw new Error("Checkout intent changed. Reload the invoice.")
}
export async function removeTerminalIntent(
  customerId: string,
  invoiceId: string,
  intentKey: string
) {
  const key = storeKey(customerId, invoiceId),
    client = await sessionRedis(),
    payload = await client.get(key)
  if (!payload || openIntent(payload, encryptionKey(), key).key !== intentKey)
    return
  await client.eval(
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
    { keys: [key], arguments: [payload] }
  )
}
