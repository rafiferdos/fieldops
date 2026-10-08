import "server-only"
import { createClient } from "redis"
import { getAuthEnv } from "../env/auth"

let connection: ReturnType<typeof connect> | undefined
async function connect() {
  const client = createClient({
    url: getAuthEnv().SESSION_REDIS_URL,
    socket: { connectTimeout: 5000, reconnectStrategy: false },
    disableOfflineQueue: true,
    commandsQueueMaxLength: 100,
  })
  // No raw client errors: connection strings can contain credentials.
  client.on("error", () => {
    connection = undefined
  })
  await client.connect()
  return client.withCommandOptions({ timeout: 5000 })
}
export async function sessionRedis() {
  connection ??= connect().catch(() => {
    connection = undefined
    throw new Error("Session storage is unavailable.")
  })
  return connection
}
