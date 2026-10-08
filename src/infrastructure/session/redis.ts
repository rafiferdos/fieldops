import "server-only"
import { createClient } from "redis"
import { getAuthEnv } from "../env/auth"

let connection: ReturnType<typeof connect> | undefined
async function connect() {
  const client = createClient({
    url: getAuthEnv().SESSION_REDIS_URL,
    socket: { connectTimeout: 5000, reconnectStrategy: false },
    disableOfflineQueue: true,
  })
  // No raw client errors: connection strings can contain credentials.
  client.on("error", () => {
    connection = undefined
  })
  await client.connect()
  return client
}
export async function sessionRedis() {
  connection ??= connect().catch(() => {
    connection = undefined
    throw new Error("Session storage is unavailable.")
  })
  return connection
}
