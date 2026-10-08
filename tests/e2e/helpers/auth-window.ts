// The real backend permits ten logins per minute per source. Pace opted-in groups
// before any authentication; never retry a rejected/uncertain write or bypass limits.
export async function respectAuthWindow() {
  if (
    process.env.E2E_LIVE_WRITES !== "1" ||
    process.env.E2E_DEMO_ACCOUNTS !== "1"
  )
    return
  await new Promise((resolve) => setTimeout(resolve, 30500))
  await new Promise((resolve) => setTimeout(resolve, 30500))
}
