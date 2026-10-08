export type ApiErrorKind = "http" | "network" | "invalid-response"

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status: number | null,
    readonly details: readonly string[] = []
  ) {
    super(message)
    this.name = "ApiError"
  }
}
