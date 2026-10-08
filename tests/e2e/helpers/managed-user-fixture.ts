import { randomUUID } from "node:crypto"
import { z } from "zod"
import { serverEnvSchema } from "../../../src/infrastructure/env/schema"
import { apiSuccessSchema } from "../../../src/infrastructure/api/schemas"
import {
  credentialsSchema,
  userSchema,
} from "../../../src/features/auth/schemas"
import {
  accessUpdateSchema,
  managedUserPageSchema,
  managedUserSchema,
} from "../../../src/features/admin/users/schemas"

// All access writes are pinned to this newly registered account, never a shared demo user.
export async function createManagedUserFixture() {
  process.loadEnvFile(".env.local")
  const { API_BASE_URL: base } = serverEnvSchema.parse(process.env),
    local = z
      .object({
        DEMO_ADMIN_EMAIL: z.email(),
        DEMO_ADMIN_PASSWORD: z.string().min(1),
      })
      .parse(process.env),
    email = `access-${randomUUID().replaceAll("-", "").slice(0, 20)}@example.com`,
    password = `FieldOps-${randomUUID()}`,
    sessions: string[] = []
  async function send(
    path: string,
    method = "GET",
    token?: string,
    body?: unknown
  ) {
    const headers = new Headers()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    if (body !== undefined) headers.set("Content-Type", "application/json")
    return fetch(`${base}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    }).catch(() => {
      throw new Error(
        `Managed fixture ${method} ${path.split("?")[0]} is uncertain. Inspect before another write.`
      )
    })
  }
  async function call<T>(
    path: string,
    schema: z.ZodType<T>,
    method = "GET",
    token?: string,
    body?: unknown
  ): Promise<T> {
    const response = await send(path, method, token, body)
    if (!response.ok)
      throw new Error(
        `Managed fixture ${method} ${path.split("?")[0]} failed (${response.status}).`
      )
    return apiSuccessSchema(schema).parse(await response.json()).data
  }
  async function login(address: string, secret: string) {
    const auth = await call(
      "/auth/login",
      credentialsSchema,
      "POST",
      undefined,
      { email: address, password: secret }
    )
    sessions.push(auth.accessToken)
    return auth
  }
  const admin = await login(local.DEMO_ADMIN_EMAIL, local.DEMO_ADMIN_PASSWORD)
  const user = await call("/auth/register", userSchema, "POST", undefined, {
    name: "Disposable Access Verification",
    email,
    password,
  })
  if (user.id === admin.user.id || user.email !== email)
    throw new Error("Disposable identity did not match registration")
  const original = await login(email, password)
  let latest = original.accessToken
  async function getUser() {
    const page = await call(
      `/admin/users?${new URLSearchParams({ q: email, limit: "100" })}`,
      managedUserPageSchema,
      "GET",
      admin.accessToken
    )
    const record = page.items.find(
      (entry) => entry.id === user.id && entry.email === email
    )
    if (!record)
      throw new Error(
        "Exact disposable account was not found; no access write is allowed"
      )
    return record
  }
  async function setAccess(input: z.infer<typeof accessUpdateSchema>) {
    await getUser()
    return call(
      `/admin/users/${user.id}`,
      managedUserSchema,
      "PATCH",
      admin.accessToken,
      accessUpdateSchema.parse(input)
    )
  }
  return {
    id: user.id,
    email,
    password,
    getUser,
    setAccess,
    async freshLogin() {
      const auth = await login(email, password)
      latest = auth.accessToken
      return auth.user
    },
    async originalProfileStatus() {
      return (await send("/users/me", "GET", original.accessToken)).status
    },
    async latestProfileStatus() {
      return (await send("/users/me", "GET", latest)).status
    },
    async originalRefreshStatus() {
      return (
        await send("/auth/refresh", "POST", undefined, {
          refreshToken: original.refreshToken,
        })
      ).status
    },
    async passwordLoginStatus() {
      return (await send("/auth/login", "POST", undefined, { email, password }))
        .status
    },
    async cleanup() {
      try {
        const current = await getUser()
        if (current.role !== "CUSTOMER" || current.status !== "ACTIVE")
          await setAccess({ role: "CUSTOMER", status: "ACTIVE" })
      } finally {
        for (const token of sessions.reverse()) {
          const response = await send("/auth/logout", "POST", token)
          if (!response.ok && response.status !== 401)
            throw new Error(
              `Managed fixture logout failed (${response.status})`
            )
        }
      }
    },
  }
}
