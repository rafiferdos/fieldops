import { randomInt, randomUUID } from "node:crypto"
import { z } from "zod"
import { apiSuccessSchema } from "../../../src/infrastructure/api/schemas"
import { serverEnvSchema } from "../../../src/infrastructure/env/schema"
import {
  credentialsSchema,
  profileSchema,
} from "../../../src/features/auth/schemas"
import { servicePageSchema } from "../../../src/features/services/schemas"
import { requestSchema } from "../../../src/features/requests/schemas"
import { availabilityPageSchema } from "../../../src/features/dispatch/schemas"
import {
  workDetailSchema,
  workOrderSchema,
} from "../../../src/features/work-orders/schemas"

// Live checks create only owned disposable records; never mutate existing work fixtures.
export async function createDispatchFixture() {
  // A dedicated local payment fixture may select its own ignored configuration.
  process.loadEnvFile(process.env.E2E_ENV_FILE ?? ".env.local")
  const { API_BASE_URL: base } = serverEnvSchema.parse(process.env)
  const local = z
    .object({
      DEMO_ADMIN_EMAIL: z.email(),
      DEMO_ADMIN_PASSWORD: z.string().min(1),
      DEMO_TECHNICIAN_EMAIL: z.email(),
      DEMO_TECHNICIAN_PASSWORD: z.string().min(1),
    })
    .parse(process.env)
  async function call<T>(
    path: string,
    schema: z.ZodType<T>,
    token?: string,
    method = "GET",
    body?: unknown
  ): Promise<T> {
    const headers = new Headers()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    if (body !== undefined) headers.set("Content-Type", "application/json")
    const response = await fetch(`${base}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    }).catch(() => {
      throw new Error(
        `Disposable fixture ${method} ${path.split("?")[0]} could not reach the backend. Inspect current state before another write.`
      )
    })
    // Do not include response bodies: authentication responses contain credentials.
    if (!response.ok)
      throw new Error(
        `Disposable fixture ${method} ${path} failed (${response.status}).`
      )
    return apiSuccessSchema(schema).parse(await response.json()).data
  }
  const sessions: string[] = [],
    requestIds: string[] = []
  async function login(email: string, password: string) {
    const auth = await call(
      "/auth/login",
      credentialsSchema,
      undefined,
      "POST",
      { email, password }
    )
    sessions.push(auth.accessToken)
    return auth
  }
  const admin = await login(local.DEMO_ADMIN_EMAIL, local.DEMO_ADMIN_PASSWORD)
  const technician = await login(
    local.DEMO_TECHNICIAN_EMAIL,
    local.DEMO_TECHNICIAN_PASSWORD
  )
  const marker = randomUUID(),
    email = `dispatch-${marker.replaceAll("-", "").slice(0, 20)}@example.com`,
    password = `FieldOps-${randomUUID()}`
  await call("/auth/register", z.unknown(), undefined, "POST", {
    name: "Dispatch Verification",
    email,
    password,
  })
  const customer = await login(email, password)
  const startDate = new Date(
    Date.now() + (30 + randomInt(60)) * 86400000 + randomInt(1440) * 60000
  )
  startDate.setUTCSeconds(0, 0)
  const start = startDate.toISOString(),
    end = new Date(startDate.getTime() + 3600000).toISOString()
  async function cleanup() {
    try {
      for (const id of requestIds) {
        const request = await call(
          `/requests/${id}`,
          requestSchema,
          admin.accessToken
        )
        if (
          (request.status === "PENDING" || request.status === "APPROVED") &&
          (!request.workOrder || request.workOrder.status === "ASSIGNED")
        )
          await call(
            `/requests/${id}/cancel`,
            requestSchema,
            admin.accessToken,
            "POST",
            {
              version: request.version,
              reason: "Disposable dispatch verification cleanup",
            }
          )
      }
    } finally {
      for (const token of sessions)
        await call("/auth/logout", z.null(), token, "POST")
    }
  }
  try {
    const catalog = await call("/services?limit=100", servicePageSchema)
    let chosen: (typeof catalog.items)[number] | undefined
    for (const service of catalog.items) {
      const query = new URLSearchParams({
        serviceId: service.id,
        start,
        end,
        page: "1",
        limit: "20",
      })
      const available = await call(
        `/technicians?${query}`,
        availabilityPageSchema,
        admin.accessToken
      )
      if (available.items.some((item) => item.id === technician.user.id)) {
        chosen = service
        break
      }
    }
    if (!chosen)
      throw new Error(
        "No service/window found for the dedicated demo technician; no skills were overwritten."
      )
    const service = chosen
    return {
      marker,
      email,
      password,
      service,
      technician: technician.user,
      window: { start, end },
      cleanup,
      // UI-created fixtures are verified as owned before becoming eligible for cleanup.
      async trackRequest(id: string) {
        const request = await call(
          `/requests/${z.uuid().parse(id)}`,
          requestSchema,
          customer.accessToken
        )
        requestIds.push(request.id)
      },
      async createRequest(approved = false) {
        const request = await call(
          "/requests",
          requestSchema,
          customer.accessToken,
          "POST",
          {
            serviceId: service.id,
            description: `Disposable dispatch verification ${marker}`,
            address: "Disposable service address, Dhaka",
            preferredStart: start,
          }
        )
        requestIds.push(request.id)
        if (approved)
          return call(
            `/requests/${request.id}/review`,
            requestSchema,
            admin.accessToken,
            "PATCH",
            { version: request.version, decision: "APPROVE" }
          )
        return request
      },
      async getWork(id: string) {
        return call(`/work-orders/${id}`, workDetailSchema, admin.accessToken)
      },
      async prepareBillingProfile() {
        return call("/users/me", profileSchema, customer.accessToken, "PATCH", {
          name: "Disposable Billing Test",
          phone: "+8801712345678",
        })
      },
      async completeAssignedWork(id: string) {
        let work = await call(
          `/work-orders/${id}`,
          workOrderSchema,
          technician.accessToken
        )
        for (const status of ["EN_ROUTE", "IN_PROGRESS"]) {
          work = await call(
            `/work-orders/${id}/status`,
            workOrderSchema,
            technician.accessToken,
            "PATCH",
            { version: work.version, status }
          )
        }
        return call(
          `/work-orders/${id}/complete`,
          workOrderSchema,
          technician.accessToken,
          "POST",
          {
            version: work.version,
            report: `Completed disposable billing verification ${marker}.`,
          }
        )
      },
      async assign(requestId: string) {
        return call(
          `/requests/${requestId}/assignment`,
          workOrderSchema,
          admin.accessToken,
          "POST",
          { technicianId: technician.user.id, start, end }
        )
      },
      // Explicitly test the documented identical replay; production never retries it automatically.
      async replayCompletion(id: string, version: number, report: string) {
        return call(
          `/work-orders/${id}/complete`,
          workOrderSchema,
          technician.accessToken,
          "POST",
          { version, report }
        )
      },
    }
  } catch (error) {
    await cleanup()
    throw error
  }
}
