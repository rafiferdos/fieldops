// A dependency outage must remain distinct from an expired or missing session.
export class SessionStorageUnavailableError extends Error {
  constructor() {
    super("Session storage is unavailable.")
    this.name = "SessionStorageUnavailableError"
  }
}
