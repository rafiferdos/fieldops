import { z } from "zod"

const apiBaseUrl = z
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) return false
    const url = new URL(value)
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    return (
      (url.protocol === "https:" || (local && url.protocol === "http:")) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.replace(/\/$/, "") === "/api/v1"
    )
  }, "Use HTTPS (or localhost HTTP) with the /api/v1 path and no credentials, query, or fragment")
  .transform((value) => value.replace(/\/$/, ""))

export const serverEnvSchema = z.object({ API_BASE_URL: apiBaseUrl })
