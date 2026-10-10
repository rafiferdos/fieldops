import "server-only"
import { randomUUID } from "node:crypto"
import { setTimeout } from "node:timers/promises"
import { getAuthEnv } from "../env/auth"
import { sessionRedis } from "./redis"
import { SessionStorageUnavailableError } from "./error"
import {
  newSessionId,
  openTokens,
  sealTokens,
  sessionKey,
  type SessionTokens,
} from "./crypto"

function encryptionKey() {
  return Buffer.from(getAuthEnv().SESSION_ENCRYPTION_KEY, "base64")
}

export async function createStoredSession(tokens: SessionTokens) {
  const id = newSessionId(),
    key = sessionKey(id)
  const created = await (
    await sessionRedis()
  ).set(key, sealTokens(tokens, encryptionKey(), key), {
    PX: Math.max(1, tokens.refreshExpiresAt - Date.now()),
    NX: true,
  })
  if (created !== "OK") throw new Error("Session could not be created.")
  return id
}

export async function deleteStoredSession(id: string) {
  await (await sessionRedis()).del(sessionKey(id))
}

export async function readStoredSession(id: string) {
  const key = sessionKey(id)
  let payload: string | null
  try {
    payload = await (await sessionRedis()).get(key)
  } catch {
    // A disconnected command is an outage, not proof that the account signed out.
    throw new SessionStorageUnavailableError()
  }
  return payload ? openTokens(payload, encryptionKey(), key) : null
}

export async function withSessionLock<T>(
  id: string,
  operation: (save: (tokens: SessionTokens) => Promise<void>) => Promise<T>
) {
  const client = await sessionRedis(),
    key = sessionKey(id),
    lock = `${key}:lock`,
    owner = randomUUID()
  const deadline = Date.now() + 35000
  while ((await client.set(lock, owner, { NX: true, PX: 60000 })) !== "OK") {
    if (Date.now() >= deadline)
      throw new Error("Session is busy. Please try again.")
    await setTimeout(50)
  }
  async function save(tokens: SessionTokens) {
    const result = await client.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] and redis.call('EXISTS', KEYS[2]) == 1 then return redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3]) else return nil end",
      {
        keys: [lock, key],
        arguments: [
          owner,
          sealTokens(tokens, encryptionKey(), key),
          String(Math.max(1, tokens.refreshExpiresAt - Date.now())),
        ],
      }
    )
    if (result !== "OK")
      throw new Error("Session changed. Please sign in again.")
  }
  try {
    return await operation(save)
  } finally {
    await client.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
      { keys: [lock], arguments: [owner] }
    )
  }
}
