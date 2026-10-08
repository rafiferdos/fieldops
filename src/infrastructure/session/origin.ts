import "server-only"
import { headers } from "next/headers"
import { getAuthEnv } from "../env/auth"

export async function requireSameOrigin() {
  if ((await headers()).get("origin") !== getAuthEnv().APP_ORIGIN)
    throw new Error("Untrusted action origin.")
}
